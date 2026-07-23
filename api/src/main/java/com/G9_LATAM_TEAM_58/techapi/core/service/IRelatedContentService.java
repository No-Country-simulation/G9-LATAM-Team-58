package com.G9_LATAM_TEAM_58.techapi.core.service;

import com.G9_LATAM_TEAM_58.techapi.core.dto.RelatedContentResponse;

public interface IRelatedContentService {
    RelatedContentResponse getRelated(String id, int limit);
}
