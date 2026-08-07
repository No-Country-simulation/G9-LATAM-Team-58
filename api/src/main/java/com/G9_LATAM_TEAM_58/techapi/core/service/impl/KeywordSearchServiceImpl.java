package com.G9_LATAM_TEAM_58.techapi.core.service.impl;

import com.G9_LATAM_TEAM_58.techapi.common.dto.SearchResponse;
import com.G9_LATAM_TEAM_58.techapi.common.dto.SearchResult;
import com.G9_LATAM_TEAM_58.techapi.core.service.IKeywordSearchService;
import com.G9_LATAM_TEAM_58.techapi.domain.ContentRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@ConditionalOnProperty(name = "app.database.enabled", havingValue = "true")
public class KeywordSearchServiceImpl implements IKeywordSearchService {

    private final ContentRepository contentRepository;

    public KeywordSearchServiceImpl(ContentRepository contentRepository) {
        this.contentRepository = contentRepository;
    }

    @Override
    public SearchResponse search(String q, String category, int page, int size) {
        // Build query: if category is provided, incorporate it
        String query = q;
        if (category != null && !category.isBlank()) {
            query = q + " " + category;
        }

        PageRequest pageable = PageRequest.of(page, size);
        Page<Object[]> contentPage = contentRepository.keywordSearch(query, pageable);

        List<SearchResult> results = contentPage.getContent().stream()
                .map(row -> {
                    SearchResult sr = new SearchResult();
                    sr.setId((String) row[0]);
                    sr.setTitle((String) row[1]);
                    sr.setCategory((String) row[2]);
                    sr.setSimilarity(1.0); // keyword matches have equal similarity
                    return sr;
                })
                .toList();

        SearchResponse response = new SearchResponse();
        response.setMode("keyword");
        response.setTotal(contentPage.getTotalElements());
        response.setElapsedMs(0);
        response.setResults(results);
        return response;
    }
}
