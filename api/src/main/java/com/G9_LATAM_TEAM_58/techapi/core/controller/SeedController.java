package com.G9_LATAM_TEAM_58.techapi.core.controller;

import com.G9_LATAM_TEAM_58.techapi.common.dto.CorpusSeedRequest;
import com.G9_LATAM_TEAM_58.techapi.common.dto.CorpusSeedResponse;
import com.G9_LATAM_TEAM_58.techapi.common.exception.InferenceUnavailableException;
import com.G9_LATAM_TEAM_58.techapi.core.service.ICorpusSeedService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/admin")
public class SeedController {

    private static final Logger log = LoggerFactory.getLogger(SeedController.class);
    private final ICorpusSeedService corpusSeedService;

    public SeedController(Optional<ICorpusSeedService> corpusSeedService) {
        this.corpusSeedService = corpusSeedService.orElse(null);
    }

    @PostMapping("/seed")
    public CorpusSeedResponse seed(@Valid @RequestBody CorpusSeedRequest request) {
        if (corpusSeedService == null) {
            throw new InferenceUnavailableException(
                "Base de datos no configurada. Use app.database.enabled=true"
            );
        }
        log.info("Seed request recibido con {} documentos", request.getDocuments().size());
        return corpusSeedService.seed(request);
    }
}
