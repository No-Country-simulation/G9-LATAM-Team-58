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
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("db")
@Tag("integration")
class HealthIntegrationTest {

    @Autowired
    private ApplicationContext applicationContext;

    private RestClient restClient;

    @BeforeEach
    void setUp() {
        LocalTestWebServer webServer = LocalTestWebServer.get(applicationContext);
        restClient = RestClient.builder().baseUrl(webServer.uri()).build();
    }

    @Test
    void testHealthUp() {
        ResponseEntity<String> response = get("/health");

        assertEquals(200, response.getStatusCode().value());

        DocumentContext body = JsonPath.parse(response.getBody());

        String status = body.read("$.status", String.class);
        assertNotNull(status, "status must be present");
        assertFalse(status.isBlank(), "status must not be blank");
        assertTrue(status.equals("UP") || status.equals("DEGRADED"),
                "status must be UP or DEGRADED but was: " + status);

        String timestamp = body.read("$.timestamp", String.class);
        assertNotNull(timestamp, "timestamp must be present");
        assertFalse(timestamp.isBlank(), "timestamp must not be blank");

        List<Map<String, Object>> dependencies = body.read("$.dependencies", List.class);
        assertNotNull(dependencies, "dependencies must be present");
        assertTrue(dependencies.size() >= 2, "expected at least inference and database dependencies");

        assertDependencyShape(dependencies, "inference");
        assertDependencyShape(dependencies, "database");
    }

    private void assertDependencyShape(List<Map<String, Object>> dependencies, String expectedName) {
        Map<String, Object> dependency = dependencies.stream()
                .filter(dep -> expectedName.equals(dep.get("name")))
                .findFirst()
                .orElse(null);

        assertNotNull(dependency, "missing dependency named '" + expectedName + "'");
        assertNotNull(dependency.get("enabled"), "dependency '" + expectedName + "' must expose enabled");
        assertNotNull(dependency.get("reachable"), "dependency '" + expectedName + "' must expose reachable");

        Number latencyMs = (Number) dependency.get("latencyMs");
        assertNotNull(latencyMs, "dependency '" + expectedName + "' must expose latencyMs");
        assertTrue(latencyMs.longValue() >= 0,
                "dependency '" + expectedName + "' latencyMs must be >= 0 but was: " + latencyMs);
    }

    private ResponseEntity<String> get(String path) {
        return restClient.get()
                .uri(path)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> { })
                .toEntity(String.class);
    }
}
