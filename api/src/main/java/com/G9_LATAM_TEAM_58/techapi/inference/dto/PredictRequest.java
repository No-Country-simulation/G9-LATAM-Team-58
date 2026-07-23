package com.G9_LATAM_TEAM_58.techapi.inference.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class PredictRequest {
    private String text;

    public PredictRequest() {}

    public PredictRequest(String text) {
        this.text = text;
    }
}
