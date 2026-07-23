package com.G9_LATAM_TEAM_58.techapi.common.exception;

import lombok.Getter;

@Getter
public class InferenceException extends RuntimeException {
    private final String message;

    public InferenceException(String message) {
        super(message);
        this.message = message;
    }
}
