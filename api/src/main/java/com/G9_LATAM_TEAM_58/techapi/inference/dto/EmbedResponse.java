package com.G9_LATAM_TEAM_58.techapi.inference.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter @Setter @ToString
public class EmbedResponse {
    private float[] embedding;
}
