package com.G9_LATAM_TEAM_58.techapi.core.controller;

import com.G9_LATAM_TEAM_58.techapi.common.exception.InferenceUnavailableException;
import com.G9_LATAM_TEAM_58.techapi.core.dto.MapPoint;
import com.G9_LATAM_TEAM_58.techapi.core.service.IMapService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/map")
public class MapController {

    private final IMapService mapService;

    public MapController(Optional<IMapService> mapService) {
        this.mapService = mapService.orElse(null);
    }

    @GetMapping
    public List<MapPoint> getMapPoints() {
        if (mapService == null) {
            throw new InferenceUnavailableException(
                "Base de datos no configurada. Use app.database.enabled=true"
            );
        }

        return mapService.getMapPoints();
    }
}
