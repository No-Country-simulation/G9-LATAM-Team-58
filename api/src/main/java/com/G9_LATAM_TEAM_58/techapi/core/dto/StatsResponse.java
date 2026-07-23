package com.G9_LATAM_TEAM_58.techapi.core.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter @Setter
public class StatsResponse {
    private long total;
    private Map<String, Long> byCategory;
    private long addedThisWeek;
}
