package com.G9_LATAM_TEAM_58.techapi.common.exception;

/**
 * Machine-readable error codes returned in the `error` field of every failure
 * response. Part of the public contract -- three fronts match on these strings,
 * so renaming a constant is a breaking change.
 *
 * <p>Deliberately carries no HTTP status: the same code maps to different
 * statuses depending on the cause. INTERNAL_ERROR is a 500 for a failed
 * inference call but a 503 when the service is simply not wired up.
 */
public enum ErrorCode {
    VALIDATION_ERROR,
    NOT_FOUND,
    INTERNAL_ERROR
}
