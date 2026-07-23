package com.G9_LATAM_TEAM_58.techapi.core.controller;

import com.G9_LATAM_TEAM_58.techapi.common.exception.InferenceUnavailableException;
import com.G9_LATAM_TEAM_58.techapi.core.dto.RelatedContentResponse;
import com.G9_LATAM_TEAM_58.techapi.core.service.IRelatedContentService;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/contents")
public class RelatedContentController {

    private final IRelatedContentService relatedContentService;

    public RelatedContentController(Optional<IRelatedContentService> relatedContentService) {
        this.relatedContentService = relatedContentService.orElse(null);
    }

    @GetMapping("/{id}/related")
    public RelatedContentResponse getRelated(
            @PathVariable String id,
            @RequestParam(defaultValue = "5") int limit) {

        if (relatedContentService == null) {
            throw new InferenceUnavailableException(
                "Base de datos no configurada. Use app.database.enabled=true"
            );
        }

        return relatedContentService.getRelated(id, limit);
    }
}
