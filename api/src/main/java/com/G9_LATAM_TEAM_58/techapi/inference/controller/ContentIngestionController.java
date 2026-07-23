package com.G9_LATAM_TEAM_58.techapi.inference.controller;

import com.G9_LATAM_TEAM_58.techapi.common.exception.InferenceUnavailableException;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.ContentIngestionRequest;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.ContentIngestionResponse;
import com.G9_LATAM_TEAM_58.techapi.inference.service.IContentIngestionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/content")
public class ContentIngestionController {

    private final IContentIngestionService contentIngestionService;

    public ContentIngestionController(Optional<IContentIngestionService> contentIngestionService) {
        this.contentIngestionService = contentIngestionService.orElse(null);
    }

    @PostMapping
    public ResponseEntity<ContentIngestionResponse> ingest(@Valid @RequestBody ContentIngestionRequest request) {
        if (contentIngestionService == null) {
            throw new InferenceUnavailableException(
                "Base de datos no configurada. Use app.database.enabled=true"
            );
        }
        ContentIngestionResponse response = contentIngestionService.ingest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
