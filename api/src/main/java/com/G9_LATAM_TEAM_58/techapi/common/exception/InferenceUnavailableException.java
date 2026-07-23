package com.G9_LATAM_TEAM_58.techapi.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@Getter
@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
public class InferenceUnavailableException extends RuntimeException {
    private final String message;

    public InferenceUnavailableException(String message) {
        super(message);
        this.message = message;
    }
}
