package com.G9_LATAM_TEAM_58.techapi.core.service.impl;

import com.G9_LATAM_TEAM_58.techapi.common.exception.NotFoundException;
import com.G9_LATAM_TEAM_58.techapi.core.dto.ContentDetail;
import com.G9_LATAM_TEAM_58.techapi.core.dto.ContentListResponse;
import com.G9_LATAM_TEAM_58.techapi.core.dto.ContentSummary;
import com.G9_LATAM_TEAM_58.techapi.core.service.IContentQueryService;
import com.G9_LATAM_TEAM_58.techapi.domain.Content;
import com.G9_LATAM_TEAM_58.techapi.domain.ContentRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "app.database.enabled", havingValue = "true")
public class ContentQueryServiceImpl implements IContentQueryService {

    private final ContentRepository contentRepository;

    public ContentQueryServiceImpl(ContentRepository contentRepository) {
        this.contentRepository = contentRepository;
    }

    @Override
    public ContentListResponse listContents(String category, String q, String sort, int page, int size) {
        Pageable pageable;
        if ("added_at".equals(sort) || "addedAt".equals(sort)) {
            pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "addedAt"));
        } else {
            pageable = PageRequest.of(page, size);
        }

        boolean hasCategory = category != null && !category.isBlank();
        boolean hasQuery = q != null && !q.isBlank();

        Page<Content> contentPage;
        if (hasCategory && hasQuery) {
            contentPage = contentRepository.findAllByCategoryAndTitleContainingIgnoreCase(category, q, pageable);
        } else if (hasCategory) {
            contentPage = contentRepository.findAllByCategory(category, pageable);
        } else if (hasQuery) {
            contentPage = contentRepository.findAllByTitleContainingIgnoreCase(q, pageable);
        } else {
            contentPage = contentRepository.findAll(pageable);
        }

        var items = contentPage.stream()
                .map(c -> {
                    ContentSummary summary = new ContentSummary();
                    summary.setId(c.getId());
                    summary.setTitle(c.getTitle());
                    summary.setCategory(c.getCategory());
                    summary.setSource(c.getSource());
                    summary.setLanguage(c.getLanguage());
                    summary.setAddedAt(c.getAddedAt());
                    return summary;
                })
                .toList();

        return new ContentListResponse(contentPage.getTotalElements(), items);
    }

    @Override
    public ContentDetail getContentById(String id) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Contenido no encontrado: " + id));

        ContentDetail detail = new ContentDetail();
        detail.setId(content.getId());
        detail.setTitle(content.getTitle());
        detail.setBody(content.getBody());
        detail.setCategory(content.getCategory());
        detail.setProbability(content.getProbability());
        detail.setKeywords(content.getKeywords());
        detail.setExplanation(content.getExplanation());
        detail.setSource(content.getSource());
        detail.setUrl(content.getUrl());
        detail.setLanguage(content.getLanguage());
        detail.setAddedAt(content.getAddedAt());

        return detail;
    }
}
