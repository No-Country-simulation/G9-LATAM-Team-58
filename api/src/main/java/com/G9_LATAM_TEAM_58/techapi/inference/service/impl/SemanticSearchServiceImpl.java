package com.G9_LATAM_TEAM_58.techapi.inference.service.impl;

import com.G9_LATAM_TEAM_58.techapi.common.dto.SearchResult;
import com.G9_LATAM_TEAM_58.techapi.common.util.VectorUtils;
import com.G9_LATAM_TEAM_58.techapi.domain.ContentRepository;
import com.G9_LATAM_TEAM_58.techapi.inference.client.IInferenceClient;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.EmbedResponse;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.SearchResponse;
import com.G9_LATAM_TEAM_58.techapi.inference.service.ISemanticSearchService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@ConditionalOnProperty(name = "app.database.enabled", havingValue = "true")
public class SemanticSearchServiceImpl implements ISemanticSearchService {

    private final IInferenceClient inferenceClient;
    private final ContentRepository contentRepository;

    public SemanticSearchServiceImpl(IInferenceClient inferenceClient,
                                      ContentRepository contentRepository) {
        this.inferenceClient = inferenceClient;
        this.contentRepository = contentRepository;
    }

    @Override
    public SearchResponse search(String q, String category, int page, int size) {
        long start = System.currentTimeMillis();

        EmbedResponse embedding = inferenceClient.embed(q, "query");
        byte[] queryBytes = VectorUtils.toBytes(embedding.getEmbedding());
        int offset = page * size;

        List<Object[]> rows;
        if (category != null && !category.isBlank()) {
            rows = contentRepository.semanticSearchWithCategory(queryBytes, category, offset, size);
        } else {
            rows = contentRepository.semanticSearch(queryBytes, offset, size);
        }

        List<SearchResult> results = rows.stream()
                .map(row -> {
                    SearchResult sr = new SearchResult();
                    sr.setId((String) row[0]);
                    sr.setTitle((String) row[1]);
                    sr.setCategory((String) row[2]);
                    sr.setSimilarity(((Number) row[3]).doubleValue());
                    return sr;
                })
                .toList();

        long elapsed = System.currentTimeMillis() - start;

        SearchResponse response = new SearchResponse();
        response.setMode("semantic");
        response.setTotal(results.size());
        response.setElapsedMs(elapsed);
        response.setResults(results);

        return response;
    }
}
