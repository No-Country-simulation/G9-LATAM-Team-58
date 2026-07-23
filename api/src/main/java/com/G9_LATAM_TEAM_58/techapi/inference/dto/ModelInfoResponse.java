package com.G9_LATAM_TEAM_58.techapi.inference.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;
import java.util.Map;

@Getter @Setter @ToString
public class ModelInfoResponse {
    private String version;
    private String embeddingModel;
    private int dim;
    private List<String> categories;
    private Map<String, Double> metrics;
}
