package com.G9_LATAM_TEAM_58.techapi.core.service;

import com.G9_LATAM_TEAM_58.techapi.core.dto.ContentDetail;
import com.G9_LATAM_TEAM_58.techapi.core.dto.ContentSummary;

import java.util.List;

public interface IContentQueryService {
    List<ContentSummary> listContents(String category, String sort, int page, int size);
    ContentDetail getContentById(String id);
}
