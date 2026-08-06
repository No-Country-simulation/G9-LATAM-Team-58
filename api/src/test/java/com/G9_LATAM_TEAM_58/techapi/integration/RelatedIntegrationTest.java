package com.G9_LATAM_TEAM_58.techapi.integration;

import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.http.server.LocalTestWebServer;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("db")
@Tag("integration")
class RelatedIntegrationTest {

    @Autowired
    private ApplicationContext applicationContext;

    private RestClient restClient;

    @BeforeEach
    void setUp() {
        LocalTestWebServer webServer = LocalTestWebServer.get(applicationContext);
        restClient = RestClient.builder().baseUrl(webServer.uri()).build();
    }

    @Test
    void testGetRelated() {
        // Fixture: real row seeded into Oracle ATP (corpus of 16,320 docs, schema TECHMIND_USER).
        // If the corpus is ever re-scraped and this Stack Overflow question drops out, re-seed
        // or pick another id from SELECT id FROM contents WHERE source='stackoverflow' FETCH FIRST 1 ROWS ONLY.
        // The parent row exists in the seed, so /related resolves; the 404 path is covered
        // separately by testGetRelatedNotFound (no-existe-xyz).
        ResponseEntity<String> response = get("/contents/so-32472760/related?limit=3");

        assertEquals(200, response.getStatusCode().value());

        DocumentContext body = JsonPath.parse(response.getBody());

        List<Map<String, Object>> related = body.read("$.related", List.class);
        assertNotNull(related, "related must be present");
        assertTrue(related.size() <= 3, "related must contain at most 3 items but was: " + related.size());

        for (Map<String, Object> item : related) {
            Number similarity = (Number) item.get("similarity");
            assertNotNull(similarity, "each related item must expose similarity");
            assertTrue(similarity.doubleValue() >= 0,
                    "similarity must be >= 0 but was: " + similarity);
        }
    }

    @Test
    void testGetRelatedNotFound() {
        ResponseEntity<String> response = get("/contents/no-existe-xyz/related");

        assertEquals(404, response.getStatusCode().value());
    }

    private ResponseEntity<String> get(String path) {
        return restClient.get()
                .uri(path)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> { })
                .toEntity(String.class);
    }
}
