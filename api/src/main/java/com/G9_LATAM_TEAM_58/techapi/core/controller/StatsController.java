package com.G9_LATAM_TEAM_58.techapi.core.controller;

import com.G9_LATAM_TEAM_58.techapi.common.exception.InferenceUnavailableException;
import com.G9_LATAM_TEAM_58.techapi.core.dto.StatsResponse;
import com.G9_LATAM_TEAM_58.techapi.core.service.IStatsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/stats")
public class StatsController {

    private final IStatsService statsService;

    public StatsController(Optional<IStatsService> statsService) {
        this.statsService = statsService.orElse(null);
    }

    @GetMapping
    public StatsResponse getStats() {
        if (statsService == null) {
            throw new InferenceUnavailableException(
                "Base de datos no configurada. Use app.database.enabled=true"
            );
        }

        return statsService.getStats();
    }
}
