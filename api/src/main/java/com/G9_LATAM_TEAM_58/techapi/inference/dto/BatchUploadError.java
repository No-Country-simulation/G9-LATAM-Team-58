package com.G9_LATAM_TEAM_58.techapi.inference.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@AllArgsConstructor
public class BatchUploadError {
    private int row;
    private String reason;
}
