package com.G9_LATAM_TEAM_58.techapi.inference.service;

import com.G9_LATAM_TEAM_58.techapi.inference.dto.ContentIngestionRequest;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.ContentIngestionResponse;

public interface IContentIngestionService {
    ContentIngestionResponse ingest(ContentIngestionRequest request);
}
