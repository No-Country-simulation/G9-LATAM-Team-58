package com.G9_LATAM_TEAM_58.techapi.core.service;

import com.G9_LATAM_TEAM_58.techapi.core.dto.ContentDetail;
import com.G9_LATAM_TEAM_58.techapi.core.dto.ContentListResponse;

public interface IContentQueryService {
    ContentListResponse listContents(String category, String q, String sort, int page, int size);
    ContentDetail getContentById(String id);
}
