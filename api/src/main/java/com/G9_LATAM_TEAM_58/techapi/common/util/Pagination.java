package com.G9_LATAM_TEAM_58.techapi.common.util;

import com.G9_LATAM_TEAM_58.techapi.common.exception.ValidationException;

/**
 * Bounds on the `page` / `size` query parameters, shared by every paginated
 * endpoint so they cannot drift apart.
 */
public final class Pagination {

    /**
     * Ceiling on rows per page. Without it `?size=1000000` is accepted as-is and
     * the database is asked for the whole table in one request -- and in the
     * semantic case, ranked by vector distance first.
     *
     * <p>Rejected rather than clamped: silently returning 100 rows to a caller
     * that asked for 5000 looks like the corpus is that small.
     */
    public static final int MAX_PAGE_SIZE = 100;

    private Pagination() {
    }

    /** Validates the pagination parameters, or throws for a 400. */
    public static void validate(int page, int size) {
        if (page < 0) {
            throw new ValidationException("El parámetro 'page' no puede ser negativo");
        }
        if (size < 1) {
            throw new ValidationException("El parámetro 'size' debe ser al menos 1");
        }
        if (size > MAX_PAGE_SIZE) {
            throw new ValidationException(
                "El parámetro 'size' no puede superar " + MAX_PAGE_SIZE + " (recibido: " + size + ")"
            );
        }
    }
}
