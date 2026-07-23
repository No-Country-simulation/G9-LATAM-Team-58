package com.G9_LATAM_TEAM_58.techapi.inference.dto;

import com.G9_LATAM_TEAM_58.techapi.common.dto.SearchResult;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter @Setter
public class SearchResponse {
    private String mode;
    private long total;
    private long elapsedMs;
    private List<SearchResult> results;
}
