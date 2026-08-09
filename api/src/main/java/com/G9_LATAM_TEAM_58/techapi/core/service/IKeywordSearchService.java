package com.G9_LATAM_TEAM_58.techapi.core.service;

import com.G9_LATAM_TEAM_58.techapi.common.dto.SearchResponse;

public interface IKeywordSearchService {
    SearchResponse search(String q, String category, int page, int size);
}
