package com.G9_LATAM_TEAM_58.techapi.core.service.impl;

import com.G9_LATAM_TEAM_58.techapi.common.dto.CorpusDocument;
import com.G9_LATAM_TEAM_58.techapi.common.dto.CorpusSeedResponse;
import com.G9_LATAM_TEAM_58.techapi.common.util.VectorUtils;
import com.G9_LATAM_TEAM_58.techapi.domain.Content;
import com.G9_LATAM_TEAM_58.techapi.domain.ContentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Separate service bean for batch processing.
 * Extracted from CorpusSeedServiceImpl so that @Transactional is applied via proxy (no self-invocation).
 */
@Service
@ConditionalOnProperty(name = "app.database.enabled", havingValue = "true")
public class CorpusBatchProcessor {

    private static final Logger log = LoggerFactory.getLogger(CorpusBatchProcessor.class);

    private final ContentRepository contentRepository;
    private final JdbcTemplate jdbcTemplate;

    public CorpusBatchProcessor(ContentRepository contentRepository, JdbcTemplate jdbcTemplate) {
        this.contentRepository = contentRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Processes a batch of documents within a single transaction.
     * Each call gets a NEW transaction (suspended if one exists).
     * This method is public so Spring AOP can proxy @Transactional.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processBatch(List<CorpusDocument> batch, List<String> allIds, List<CorpusSeedResponse.SeedError> allErrors) {
        for (CorpusDocument doc : batch) {
            try {
                Content content = new Content();
                content.setId(doc.getId());
                content.setTitle(doc.getTitle());
                content.setBody(doc.getBody()); // persist body if provided (may be null — column is nullable)
                content.setCategory(doc.getCategory());
                content.setKeywords(doc.getKeywords());
                content.setClusterId(doc.getClusterId());
                content.setX(doc.getX() != null ? doc.getX().floatValue() : null);
                content.setY(doc.getY() != null ? doc.getY().floatValue() : null);
                content.setSource("corpus");
                content.setLanguage("es");
                content.setAddedAt(Instant.now());

                contentRepository.save(content);
                contentRepository.flush();

                byte[] embeddingBytes = VectorUtils.toBytes(doc.getEmbedding());
                jdbcTemplate.update("UPDATE contents SET embedding = ? WHERE id = ?", embeddingBytes, doc.getId());

                allIds.add(doc.getId());
            } catch (Exception e) {
                log.error("Error procesando documento {}: {}", doc.getId(), e.getMessage());
                allErrors.add(new CorpusSeedResponse.SeedError(
                    doc.getId(), e.getMessage() != null ? e.getMessage() : "Error al insertar documento"
                ));
            }
        }
    }
}
