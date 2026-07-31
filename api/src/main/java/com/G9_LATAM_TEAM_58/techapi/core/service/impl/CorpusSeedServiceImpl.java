package com.G9_LATAM_TEAM_58.techapi.core.service.impl;

import com.G9_LATAM_TEAM_58.techapi.common.dto.CorpusDocument;
import com.G9_LATAM_TEAM_58.techapi.common.dto.CorpusSeedRequest;
import com.G9_LATAM_TEAM_58.techapi.common.dto.CorpusSeedResponse;
import com.G9_LATAM_TEAM_58.techapi.core.service.ICorpusSeedService;
import com.G9_LATAM_TEAM_58.techapi.domain.Content;
import com.G9_LATAM_TEAM_58.techapi.domain.ContentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@ConditionalOnProperty(name = "app.database.enabled", havingValue = "true")
public class CorpusSeedServiceImpl implements ICorpusSeedService {

    private static final Logger log = LoggerFactory.getLogger(CorpusSeedServiceImpl.class);
    private static final int BATCH_SIZE = 100;
    private static final int EXPECTED_EMBEDDING_DIM = 384;

    private final ContentRepository contentRepository;
    private final CorpusBatchProcessor batchProcessor;

    public CorpusSeedServiceImpl(ContentRepository contentRepository, CorpusBatchProcessor batchProcessor) {
        this.contentRepository = contentRepository;
        this.batchProcessor = batchProcessor;
    }

    @Override
    public CorpusSeedResponse seed(CorpusSeedRequest request) {
        List<CorpusDocument> allDocs = request.getDocuments();
        List<String> allIds = new ArrayList<>();
        List<CorpusSeedResponse.SeedError> allErrors = new ArrayList<>();
        int totalFailed = 0;
        int totalSkipped = 0;

        // === PHASE 1: Pre-validate ALL documents at boundary ===
        // Fetch ALL existing IDs in ONE query (avoids N+1)
        Set<String> existingIds = contentRepository.findAllById(
            allDocs.stream().map(CorpusDocument::getId).toList()
        ).stream().map(Content::getId).collect(Collectors.toSet());

        List<CorpusDocument> validDocs = new ArrayList<>();
        for (CorpusDocument doc : allDocs) {
            // Guard clause: embedding validation
            if (doc.getEmbedding() == null || doc.getEmbedding().length != EXPECTED_EMBEDDING_DIM) {
                allErrors.add(new CorpusSeedResponse.SeedError(
                    doc.getId(),
                    "El embedding debe tener exactamente " + EXPECTED_EMBEDDING_DIM + " dimensiones"
                ));
                totalFailed++;
                continue;
            }

            // Guard clause: dedup
            if (existingIds.contains(doc.getId())) {
                totalSkipped++;
                continue;
            }

            validDocs.add(doc);
        }

        // Early return: if pre-validation found errors, write NOTHING
        if (totalFailed > 0) {
            log.warn("Seed pre-validation: {} errores, {} skipped. NO se escribieron documentos.",
                     totalFailed, totalSkipped);
            return buildResponse(0, totalFailed, totalSkipped, Collections.emptyList(), allErrors);
        }

        // === PHASE 2: Write valid documents in batches ===
        for (int i = 0; i < validDocs.size(); i += BATCH_SIZE) {
            int end = Math.min(i + BATCH_SIZE, validDocs.size());
            List<CorpusDocument> batch = validDocs.subList(i, end);
            try {
                batchProcessor.processBatch(batch, allIds, allErrors);
            } catch (Exception e) {
                log.error("Batch {}..{} fall\u00f3: {}", i, end, e.getMessage());
                for (CorpusDocument doc : batch) {
                    allErrors.add(new CorpusSeedResponse.SeedError(
                        doc.getId(), "Error en lote: " + e.getMessage()
                    ));
                }
                totalFailed += batch.size();
            }
        }

        int processed = allIds.size();
        totalFailed = allErrors.size();

        log.info("Seed completado: {} procesados, {} fallados, {} skipped", processed, totalFailed, totalSkipped);
        return buildResponse(processed, totalFailed, totalSkipped, allIds, allErrors);
    }

    private CorpusSeedResponse buildResponse(int processed, int failed, int skipped,
                                             List<String> ids, List<CorpusSeedResponse.SeedError> errors) {
        CorpusSeedResponse response = new CorpusSeedResponse();
        response.setProcessed(processed);
        response.setFailed(failed);
        response.setSkipped(skipped);
        response.setIds(ids);
        response.setErrors(errors);
        return response;
    }
}
