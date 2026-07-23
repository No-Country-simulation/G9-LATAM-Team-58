package com.G9_LATAM_TEAM_58.techapi.core.controller;

import com.G9_LATAM_TEAM_58.techapi.common.exception.InferenceUnavailableException;
import com.G9_LATAM_TEAM_58.techapi.core.dto.ContentDetail;
import com.G9_LATAM_TEAM_58.techapi.core.dto.ContentSummary;
import com.G9_LATAM_TEAM_58.techapi.core.service.IContentQueryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/contents")
public class ContentQueryController {

    private final IContentQueryService contentQueryService;

    public ContentQueryController(Optional<IContentQueryService> contentQueryService) {
        this.contentQueryService = contentQueryService.orElse(null);
    }

    @GetMapping
    public List<ContentSummary> listContents(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        if (contentQueryService == null) {
            throw new InferenceUnavailableException(
                "Base de datos no configurada. Use app.database.enabled=true"
            );
        }

        return contentQueryService.listContents(category, sort, page, size);
    }

    @GetMapping("/{id}")
    public ContentDetail getContentById(@PathVariable String id) {
        if (contentQueryService == null) {
            throw new InferenceUnavailableException(
                "Base de datos no configurada. Use app.database.enabled=true"
            );
        }

        return contentQueryService.getContentById(id);
    }
}
