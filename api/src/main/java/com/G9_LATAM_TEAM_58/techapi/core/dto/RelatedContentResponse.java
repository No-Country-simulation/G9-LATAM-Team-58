package com.G9_LATAM_TEAM_58.techapi.core.dto;

import com.G9_LATAM_TEAM_58.techapi.common.dto.SearchResult;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter @Setter
public class RelatedContentResponse {
    private String id;
    private String title;
    private List<SearchResult> related;
}
