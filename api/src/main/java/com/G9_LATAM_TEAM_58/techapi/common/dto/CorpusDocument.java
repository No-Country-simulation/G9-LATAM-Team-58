package com.G9_LATAM_TEAM_58.techapi.common.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter @Setter
public class CorpusDocument {
    @NotNull
    private String id;

    @NotNull
    private String title;

    private String body;  // nullable for corpus documents

    @NotNull
    private String category;

    // Validated in service: must be exactly 384 floats
    // @NotNull is enforced here, length is checked in service pre-validation
    @NotNull
    private float[] embedding;

    private Double x;
    private Double y;
    private Integer clusterId;
    private List<String> keywords;
}
