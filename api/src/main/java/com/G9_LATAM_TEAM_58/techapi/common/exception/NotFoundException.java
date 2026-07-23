package com.G9_LATAM_TEAM_58.techapi.common.exception;

import lombok.Getter;

@Getter
public class NotFoundException extends RuntimeException {
    private final String message;

    public NotFoundException(String message) {
        super(message);
        this.message = message;
    }
}
