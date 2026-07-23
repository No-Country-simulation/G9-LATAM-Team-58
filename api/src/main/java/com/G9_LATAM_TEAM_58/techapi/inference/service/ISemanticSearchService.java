package com.G9_LATAM_TEAM_58.techapi.inference.service;

import com.G9_LATAM_TEAM_58.techapi.inference.dto.SearchResponse;

public interface ISemanticSearchService {
    SearchResponse search(String q, String category, int page, int size);
}
