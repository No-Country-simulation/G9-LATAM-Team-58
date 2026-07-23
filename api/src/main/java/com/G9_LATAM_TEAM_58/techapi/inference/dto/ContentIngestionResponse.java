package com.G9_LATAM_TEAM_58.techapi.inference.dto;

import com.G9_LATAM_TEAM_58.techapi.common.dto.SearchResult;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter @Setter
public class ContentIngestionResponse {
    private String id;
    private String category;
    private double probability;
    private List<String> keywords;
    private List<SearchResult> related;
    private List<String> explanation;
}
