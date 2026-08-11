package com.G9_LATAM_TEAM_58.techapi.inference.controller;

import com.G9_LATAM_TEAM_58.techapi.common.exception.InferenceUnavailableException;
import com.G9_LATAM_TEAM_58.techapi.common.dto.SearchResponse;
import com.G9_LATAM_TEAM_58.techapi.common.exception.ValidationException;
import com.G9_LATAM_TEAM_58.techapi.core.service.IKeywordSearchService;
import com.G9_LATAM_TEAM_58.techapi.inference.service.ISemanticSearchService;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/search")
public class SearchController {

    private final ISemanticSearchService semanticSearchService;
    private final IKeywordSearchService keywordSearchService;

    public SearchController(Optional<ISemanticSearchService> semanticSearchService,
                            Optional<IKeywordSearchService> keywordSearchService) {
        this.semanticSearchService = semanticSearchService.orElse(null);
        this.keywordSearchService = keywordSearchService.orElse(null);
    }

    @GetMapping
    public SearchResponse search(
            @RequestParam String q,
            @RequestParam(defaultValue = "semantic") String mode,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "0.5") double minSimilarity) {

        if (q == null || q.isBlank()) {
            throw new ValidationException("El parámetro 'q' no puede estar vacío");
        }

        if ("semantic".equalsIgnoreCase(mode)) {
            if (semanticSearchService == null) {
                throw new InferenceUnavailableException(
                    "Base de datos no configurada. Use app.database.enabled=true"
                );
            }
            return semanticSearchService.search(q, category, page, size, minSimilarity);
        } else if ("keyword".equalsIgnoreCase(mode)) {
            if (keywordSearchService == null) {
                throw new InferenceUnavailableException(
                    "Base de datos no configurada. Use app.database.enabled=true"
                );
            }
            return keywordSearchService.search(q, category, page, size);
        } else {
            throw new ValidationException("Modo de búsqueda inválido: '" + mode + "'. Use 'semantic' o 'keyword'");
        }
    }
}
