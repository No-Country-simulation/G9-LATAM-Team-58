package com.G9_LATAM_TEAM_58.techapi.core.service.impl;

import com.G9_LATAM_TEAM_58.techapi.core.dto.StatsResponse;
import com.G9_LATAM_TEAM_58.techapi.core.service.IStatsService;
import com.G9_LATAM_TEAM_58.techapi.domain.ContentRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@ConditionalOnProperty(name = "app.database.enabled", havingValue = "true")
public class StatsServiceImpl implements IStatsService {

    private final ContentRepository contentRepository;

    public StatsServiceImpl(ContentRepository contentRepository) {
        this.contentRepository = contentRepository;
    }

    @Override
    public StatsResponse getStats() {
        long total = contentRepository.count();
        long addedThisWeek = contentRepository.findAddedThisWeek();

        List<Object[]> categoryRows = contentRepository.countByCategory();
        Map<String, Long> byCategory = new HashMap<>();
        for (Object[] row : categoryRows) {
            byCategory.put((String) row[0], ((Number) row[1]).longValue());
        }

        StatsResponse response = new StatsResponse();
        response.setTotal(total);
        response.setByCategory(byCategory);
        response.setAddedThisWeek(addedThisWeek);

        return response;
    }
}
