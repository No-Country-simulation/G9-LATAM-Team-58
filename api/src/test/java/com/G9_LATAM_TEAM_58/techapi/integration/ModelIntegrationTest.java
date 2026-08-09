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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("db")
@Tag("integration")
class ModelIntegrationTest {

    @Autowired
    private ApplicationContext applicationContext;

    private RestClient restClient;

    @BeforeEach
    void setUp() {
        LocalTestWebServer webServer = LocalTestWebServer.get(applicationContext);
        restClient = RestClient.builder().baseUrl(webServer.uri()).build();
    }

    @Test
    void testModelInfo() {
        ResponseEntity<String> response = get("/model");

        assertEquals(200, response.getStatusCode().value());

        DocumentContext body = JsonPath.parse(response.getBody());

        Number dim = body.read("$.dim", Number.class);
        assertNotNull(dim, "dim must be present");
        assertTrue(dim.intValue() > 0, "dim must be positive but was: " + dim);

        String embeddingModel = body.read("$.embeddingModel", String.class);
        assertNotNull(embeddingModel, "embeddingModel must be present");
        assertFalse(embeddingModel.isBlank(), "embeddingModel must not be blank");

        Number macroF1 = body.read("$.macroF1", Number.class);
        assertNotNull(macroF1, "macroF1 must be present");

        String version = body.read("$.version", String.class);
        assertNotNull(version, "version must be present");
        assertFalse(version.isBlank(), "version must not be blank");
    }

    private ResponseEntity<String> get(String path) {
        return restClient.get()
                .uri(path)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> { })
                .toEntity(String.class);
    }
}
