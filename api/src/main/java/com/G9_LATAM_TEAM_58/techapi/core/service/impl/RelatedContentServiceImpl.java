package com.G9_LATAM_TEAM_58.techapi.core.service.impl;

import com.G9_LATAM_TEAM_58.techapi.common.dto.SearchResult;
import com.G9_LATAM_TEAM_58.techapi.common.exception.NotFoundException;
import com.G9_LATAM_TEAM_58.techapi.core.dto.RelatedContentResponse;
import com.G9_LATAM_TEAM_58.techapi.core.service.IRelatedContentService;
import com.G9_LATAM_TEAM_58.techapi.domain.Content;
import com.G9_LATAM_TEAM_58.techapi.domain.ContentRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@ConditionalOnProperty(name = "app.database.enabled", havingValue = "true")
public class RelatedContentServiceImpl implements IRelatedContentService {

    private final ContentRepository contentRepository;

    public RelatedContentServiceImpl(ContentRepository contentRepository) {
        this.contentRepository = contentRepository;
    }

    @Override
    public RelatedContentResponse getRelated(String id, int limit) {
        Content base = contentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Contenido no encontrado: " + id));

        // Get embedding from DB
        byte[] embedding = contentRepository.findEmbeddingById(id);
        if (embedding == null) {
            throw new NotFoundException("El contenido no tiene vector de embedding asociado: " + id);
        }

        int effectiveLimit = Math.min(Math.max(limit, 1), 50);

        List<Object[]> rows = contentRepository.findRelatedContents(embedding, id, effectiveLimit);
        List<SearchResult> related = rows.stream()
                .map(row -> {
                    SearchResult sr = new SearchResult();
                    sr.setId((String) row[0]);
                    sr.setTitle((String) row[1]);
                    sr.setCategory((String) row[2]);
                    sr.setSimilarity(((Number) row[3]).doubleValue());
                    return sr;
                })
                .toList();

        RelatedContentResponse response = new RelatedContentResponse();
        response.setId(base.getId());
        response.setTitle(base.getTitle());
        response.setRelated(related);

        return response;
    }
}
