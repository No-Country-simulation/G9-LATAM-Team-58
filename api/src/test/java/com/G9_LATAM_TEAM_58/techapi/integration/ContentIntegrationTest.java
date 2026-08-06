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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("db")
@Tag("integration")
class ContentIntegrationTest {

    @Autowired
    private ApplicationContext applicationContext;

    private RestClient restClient;

    @BeforeEach
    void setUp() {
        LocalTestWebServer webServer = LocalTestWebServer.get(applicationContext);
        restClient = RestClient.builder().baseUrl(webServer.uri()).build();
    }

    @Test
    void testListContents() {
        ResponseEntity<String> response = get("/contents?page=0&size=5");

        assertEquals(200, response.getStatusCode().value());

        DocumentContext body = JsonPath.parse(response.getBody());

        List<Object> items = body.read("$.items", List.class);
        assertNotNull(items, "items must be present");
        assertFalse(items.isEmpty(), "items must not be empty");

        Number total = body.read("$.total", Number.class);
        assertNotNull(total, "total must be present");
        assertTrue(total.longValue() > 0, "total must be greater than 0 but was: " + total);
    }

    @Test
    void testGetContentById() {
        // Fixture: real row seeded into Oracle ATP (corpus of 16,320 docs, schema TECHMIND_USER).
        // If the corpus is ever re-scraped and this Stack Overflow question drops out, re-seed
        // or pick another id from SELECT id FROM contents WHERE source='stackoverflow' FETCH FIRST 1 ROWS ONLY.
        ResponseEntity<String> response = get("/contents/so-32472760");

        assertEquals(200, response.getStatusCode().value());

        DocumentContext body = JsonPath.parse(response.getBody());
        assertEquals("so-32472760", body.read("$.id", String.class));
    }

    @Test
    void testGetContentNotFound() {
        ResponseEntity<String> response = get("/contents/no-existe-xyz");

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
