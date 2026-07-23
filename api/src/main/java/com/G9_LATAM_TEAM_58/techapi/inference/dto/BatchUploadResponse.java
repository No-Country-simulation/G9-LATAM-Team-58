package com.G9_LATAM_TEAM_58.techapi.inference.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter @Setter
public class BatchUploadResponse {
    private int processed;
    private int failed;
    private List<String> ids;
    private List<BatchUploadError> errors;
    private Map<String, Long> byCategory;
}
