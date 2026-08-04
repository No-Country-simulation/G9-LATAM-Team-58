package com.G9_LATAM_TEAM_58.techapi.common.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter @Setter
public class CorpusSeedResponse {
    private int processed;
    private int failed;
    private int skipped;
    private List<String> ids;
    private List<SeedError> errors;

    @Getter @Setter
    public static class SeedError {
        private String documentId;
        private String reason;

        public SeedError() {}

        public SeedError(String documentId, String reason) {
            this.documentId = documentId;
            this.reason = reason;
        }
    }
}
