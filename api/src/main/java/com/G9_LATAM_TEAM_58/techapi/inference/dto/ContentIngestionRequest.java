package com.G9_LATAM_TEAM_58.techapi.inference.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ContentIngestionRequest {
    @NotBlank(message = "no puede estar vacío")
    private String title;

    @NotBlank(message = "no puede estar vacío")
    private String body;
}
