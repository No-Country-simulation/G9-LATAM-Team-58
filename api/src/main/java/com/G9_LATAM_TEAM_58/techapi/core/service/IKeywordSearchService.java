package com.G9_LATAM_TEAM_58.techapi.core.service;

import com.G9_LATAM_TEAM_58.techapi.common.dto.SearchResult;

import java.util.List;

public interface IKeywordSearchService {
    List<SearchResult> search(String q, String category, int page, int size);
}
