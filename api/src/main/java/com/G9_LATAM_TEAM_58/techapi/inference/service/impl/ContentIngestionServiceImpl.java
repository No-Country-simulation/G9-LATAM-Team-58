package com.G9_LATAM_TEAM_58.techapi.inference.service.impl;

import com.G9_LATAM_TEAM_58.techapi.common.dto.SearchResult;
import com.G9_LATAM_TEAM_58.techapi.common.util.VectorUtils;
import com.G9_LATAM_TEAM_58.techapi.domain.Content;
import com.G9_LATAM_TEAM_58.techapi.domain.ContentRepository;
import com.G9_LATAM_TEAM_58.techapi.inference.client.IInferenceClient;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.*;
import com.G9_LATAM_TEAM_58.techapi.inference.service.IContentIngestionService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.database.enabled", havingValue = "true")
public class ContentIngestionServiceImpl implements IContentIngestionService {

    private final IInferenceClient inferenceClient;
    private final ContentRepository contentRepository;
    private final JdbcTemplate jdbcTemplate;

    public ContentIngestionServiceImpl(IInferenceClient inferenceClient,
                                        ContentRepository contentRepository,
                                        JdbcTemplate jdbcTemplate) {
        this.inferenceClient = inferenceClient;
        this.contentRepository = contentRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public ContentIngestionResponse ingest(ContentIngestionRequest request) {
        PredictResponse prediction = inferenceClient.predict(request.getBody());

        String id = "usr-" + UUID.randomUUID().toString();

        Content content = new Content();
        content.setId(id);
        content.setTitle(request.getTitle());
        content.setBody(request.getBody());
        content.setCategory(prediction.getCategory());
        content.setProbability(prediction.getProbability());
        content.setKeywords(prediction.getKeywords());
        content.setExplanation(prediction.getExplanation());
        content.setClusterId(prediction.getClusterId());
        content.setX(prediction.getX());
        content.setY(prediction.getY());
        content.setSource("user");
        content.setLanguage("es");
        content.setAddedAt(Instant.now());

        contentRepository.save(content);
        contentRepository.flush();

        byte[] embeddingBytes = VectorUtils.toBytes(prediction.getEmbedding());
        jdbcTemplate.update("UPDATE contents SET embedding = ? WHERE id = ?", embeddingBytes, id);

        List<Object[]> relatedRows = contentRepository.findRelatedContents(embeddingBytes, id, 5);
        List<SearchResult> related = relatedRows.stream()
                .map(row -> {
                    SearchResult sr = new SearchResult();
                    sr.setId((String) row[0]);
                    sr.setTitle((String) row[1]);
                    sr.setCategory((String) row[2]);
                    sr.setSimilarity(((Number) row[3]).doubleValue());
                    return sr;
                })
                .toList();

        ContentIngestionResponse response = new ContentIngestionResponse();
        response.setId(id);
        response.setCategory(prediction.getCategory());
        response.setProbability(prediction.getProbability());
        response.setKeywords(prediction.getKeywords());
        response.setRelated(related);
        response.setExplanation(prediction.getExplanation());

        return response;
    }
}
