package com.G9_LATAM_TEAM_58.techapi.core.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter @Setter @ToString
public class ContentListResponse {
    private long total;
    private List<ContentSummary> items;

    public ContentListResponse(long total, List<ContentSummary> items) {
        this.total = total;
        this.items = items;
    }
}
