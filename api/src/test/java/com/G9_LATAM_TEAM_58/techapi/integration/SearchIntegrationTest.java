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
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("db")
@Tag("integration")
class SearchIntegrationTest {

    @Autowired
    private ApplicationContext applicationContext;

    private RestClient restClient;

    @BeforeEach
    void setUp() {
        LocalTestWebServer webServer = LocalTestWebServer.get(applicationContext);
        restClient = RestClient.builder().baseUrl(webServer.uri()).build();
    }

    @Test
    void testSemanticSearch() {
        ResponseEntity<String> response = get("/search?q=test&mode=semantic");

        assertEquals(200, response.getStatusCode().value());

        DocumentContext body = JsonPath.parse(response.getBody());
        assertEquals("semantic", body.read("$.mode", String.class));

        List<Object> results = body.read("$.results", List.class);
        assertNotNull(results, "results must be present");

        Number elapsedMs = body.read("$.elapsedMs", Number.class);
        assertNotNull(elapsedMs, "elapsedMs must be present");
    }

    @Test
    void testKeywordSearch() {
        ResponseEntity<String> response = get("/search?q=test&mode=keyword");

        assertEquals(200, response.getStatusCode().value());

        DocumentContext body = JsonPath.parse(response.getBody());
        assertEquals("keyword", body.read("$.mode", String.class));

        List<Object> results = body.read("$.results", List.class);
        assertNotNull(results, "results must be present");
    }

    @Test
    void testSearchRejectsBlankQuery() {
        ResponseEntity<String> response = get("/search?q=&mode=semantic");

        assertEquals(400, response.getStatusCode().value());
    }

    @Test
    void testSearchRejectsInvalidMode() {
        ResponseEntity<String> response = get("/search?q=test&mode=invalid");

        assertEquals(400, response.getStatusCode().value());
    }

    private ResponseEntity<String> get(String path) {
        return restClient.get()
                .uri(path)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> { })
                .toEntity(String.class);
    }
}
