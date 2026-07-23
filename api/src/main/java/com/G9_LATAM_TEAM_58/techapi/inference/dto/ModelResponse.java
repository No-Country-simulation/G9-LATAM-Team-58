package com.G9_LATAM_TEAM_58.techapi.inference.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ModelResponse {
    private String version;
    private String embeddingModel;
    private int dim;
    private double macroF1;
}
