package com.G9_LATAM_TEAM_58.techapi.common.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class ApiError {
    private String error;
    private String message;
    private String timestamp;

    /**
     * Builds the error body. `error` is the machine-readable code from
     * {@link ErrorCode} and stays in English; `message` is the only part the end
     * user reads, so it is in Spanish.
     */
    public static ApiError of(ErrorCode error, String message) {
        return new ApiError(error.name(), message, Instant.now().toString());
    }
}
