package com.G9_LATAM_TEAM_58.techapi.core.service.impl;

import com.G9_LATAM_TEAM_58.techapi.common.exception.NotFoundException;
import com.G9_LATAM_TEAM_58.techapi.core.dto.ContentDetail;
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

import java.util.List;

@Service
@ConditionalOnProperty(name = "app.database.enabled", havingValue = "true")
public class ContentQueryServiceImpl implements IContentQueryService {

    private final ContentRepository contentRepository;

    public ContentQueryServiceImpl(ContentRepository contentRepository) {
        this.contentRepository = contentRepository;
    }

    @Override
    public List<ContentSummary> listContents(String category, String sort, int page, int size) {
        Pageable pageable;
        if ("added_at".equals(sort) || "addedAt".equals(sort)) {
            pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "addedAt"));
        } else {
            pageable = PageRequest.of(page, size);
        }

        Page<Content> contentPage;
        if (category != null && !category.isBlank()) {
            contentPage = contentRepository.findAllByCategory(category, pageable);
        } else {
            contentPage = contentRepository.findAll(pageable);
        }

        return contentPage.stream()
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
