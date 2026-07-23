package com.G9_LATAM_TEAM_58.techapi.core.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter @Setter @ToString
public class MapPoint {
    private String id;
    private String title;
    private String category;
    private double x;
    private double y;
}
