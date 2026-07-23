package com.G9_LATAM_TEAM_58.techapi.core.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.Instant;
import java.util.List;

@Getter @Setter @ToString
public class ContentDetail {
    private String id;
    private String title;
    private String body;
    private String category;
    private Double probability;
    private List<String> keywords;
    private List<String> explanation;
    private String source;
    private String url;
    private String language;
    private Instant addedAt;
}
