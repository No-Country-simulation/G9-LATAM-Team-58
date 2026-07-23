package com.G9_LATAM_TEAM_58.techapi.core.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.Instant;

@Getter @Setter @ToString
public class ContentSummary {
    private String id;
    private String title;
    private String category;
    private String source;
    private String language;
    private Instant addedAt;
}
