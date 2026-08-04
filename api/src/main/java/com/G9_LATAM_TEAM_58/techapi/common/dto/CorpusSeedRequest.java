package com.G9_LATAM_TEAM_58.techapi.common.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter @Setter
public class CorpusSeedRequest {
    @Valid
    @NotEmpty
    @Size(max = 5000)
    private List<CorpusDocument> documents;
}
