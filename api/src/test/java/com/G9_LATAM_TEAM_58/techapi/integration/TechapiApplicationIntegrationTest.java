package com.G9_LATAM_TEAM_58.techapi.integration;

import com.G9_LATAM_TEAM_58.techapi.domain.ContentRepository;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("db")
@Tag("integration")
class TechapiApplicationIntegrationTest {

    @Autowired
    private ContentRepository contentRepository;

    @Test
    void contextLoadsAgainstSeededDatabase() {
        assertTrue(contentRepository.count() > 0, "expected seeded contents in the database");
    }
}
