package com.G9_LATAM_TEAM_58.techapi.common.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
public class HealthResponse {
    private String status;
    private Instant timestamp;
    private List<DependencyStatus> dependencies;

    public HealthResponse() {}

    public HealthResponse(String status, Instant timestamp, List<DependencyStatus> dependencies) {
        this.status = status;
        this.timestamp = timestamp;
        this.dependencies = dependencies;
    }

    @Getter
    @Setter
    public static class DependencyStatus {
        private String name;
        private boolean enabled;
        private boolean reachable;
        private long latencyMs;
        private String message;

        public DependencyStatus() {}

        public DependencyStatus(String name, boolean enabled, boolean reachable, long latencyMs, String message) {
            this.name = name;
            this.enabled = enabled;
            this.reachable = reachable;
            this.latencyMs = latencyMs;
            this.message = message;
        }
    }
}
