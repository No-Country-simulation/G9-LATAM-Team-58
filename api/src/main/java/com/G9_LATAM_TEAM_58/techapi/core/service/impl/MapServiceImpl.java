package com.G9_LATAM_TEAM_58.techapi.core.service.impl;

import com.G9_LATAM_TEAM_58.techapi.core.dto.MapPoint;
import com.G9_LATAM_TEAM_58.techapi.core.service.IMapService;
import com.G9_LATAM_TEAM_58.techapi.domain.ContentRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@ConditionalOnProperty(name = "app.database.enabled", havingValue = "true")
public class MapServiceImpl implements IMapService {

    private final ContentRepository contentRepository;

    public MapServiceImpl(ContentRepository contentRepository) {
        this.contentRepository = contentRepository;
    }

    @Override
    public List<MapPoint> getMapPoints() {
        List<Object[]> rows = contentRepository.findMapPoints();
        return rows.stream()
                .map(row -> {
                    MapPoint point = new MapPoint();
                    point.setId((String) row[0]);
                    point.setTitle((String) row[1]);
                    point.setCategory((String) row[2]);
                    point.setX(((Number) row[3]).doubleValue());
                    point.setY(((Number) row[4]).doubleValue());
                    return point;
                })
                .toList();
    }
}
