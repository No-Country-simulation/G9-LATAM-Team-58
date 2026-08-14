package com.G9_LATAM_TEAM_58.techapi.unit.util;

import com.G9_LATAM_TEAM_58.techapi.common.exception.ValidationException;
import com.G9_LATAM_TEAM_58.techapi.common.util.Pagination;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PaginationUnitTest {

    @Test
    void acceptsTheDefaultsUsedByTheWeb() {
        // The two page sizes the front actually sends (search: 10, contents: 20).
        assertDoesNotThrow(() -> Pagination.validate(0, 10));
        assertDoesNotThrow(() -> Pagination.validate(3, 20));
    }

    @Test
    void acceptsExactlyTheMaximum() {
        assertDoesNotThrow(() -> Pagination.validate(0, Pagination.MAX_PAGE_SIZE));
    }

    @Test
    void rejectsOneOverTheMaximum() {
        ValidationException error = assertThrows(ValidationException.class,
                () -> Pagination.validate(0, Pagination.MAX_PAGE_SIZE + 1));

        assertTrue(error.getMessage().contains(String.valueOf(Pagination.MAX_PAGE_SIZE)));
    }

    @Test
    void rejectsTheUnboundedRequestThisGuardExistsFor() {
        assertThrows(ValidationException.class, () -> Pagination.validate(0, 1_000_000));
    }

    @Test
    void rejectsNonPositiveSize() {
        assertThrows(ValidationException.class, () -> Pagination.validate(0, 0));
        assertThrows(ValidationException.class, () -> Pagination.validate(0, -1));
    }

    @Test
    void rejectsNegativePage() {
        assertThrows(ValidationException.class, () -> Pagination.validate(-1, 10));
    }
}
