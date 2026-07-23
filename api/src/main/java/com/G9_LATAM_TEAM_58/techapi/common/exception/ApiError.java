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

    public static ApiError of(String error, String message) {
        return new ApiError(error, message, Instant.now().toString());
    }
}
