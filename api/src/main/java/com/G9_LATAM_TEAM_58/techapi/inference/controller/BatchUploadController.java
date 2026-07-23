package com.G9_LATAM_TEAM_58.techapi.inference.controller;

import com.G9_LATAM_TEAM_58.techapi.common.exception.InferenceUnavailableException;
import com.G9_LATAM_TEAM_58.techapi.common.exception.ValidationException;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.BatchUploadResponse;
import com.G9_LATAM_TEAM_58.techapi.inference.service.IBatchUploadService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@RestController
@RequestMapping("/contents/batch")
public class BatchUploadController {

    private final IBatchUploadService batchUploadService;

    public BatchUploadController(Optional<IBatchUploadService> batchUploadService) {
        this.batchUploadService = batchUploadService.orElse(null);
    }

    @PostMapping
    public BatchUploadResponse uploadBatch(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new ValidationException("El archivo no puede estar vacío");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".csv")) {
            throw new ValidationException("El archivo debe ser un CSV");
        }

        if (batchUploadService == null) {
            throw new InferenceUnavailableException(
                "Base de datos no configurada. Use app.database.enabled=true"
            );
        }

        return batchUploadService.processBatch(file);
    }
}
