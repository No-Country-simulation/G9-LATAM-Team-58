package com.G9_LATAM_TEAM_58.techapi.inference.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter @Setter @ToString
public class PredictResponse {
    private String category;
    private double probability;
    private List<String> keywords;
    private List<String> explanation;
    private float[] embedding;
    private int clusterId;
    private float x;
    private float y;
}
