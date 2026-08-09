package com.G9_LATAM_TEAM_58.techapi.integration;

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
class MapIntegrationTest {

    @Autowired
    private ApplicationContext applicationContext;

    private RestClient restClient;

    @BeforeEach
    void setUp() {
        LocalTestWebServer webServer = LocalTestWebServer.get(applicationContext);
        restClient = RestClient.builder().baseUrl(webServer.uri()).build();
    }

    @Test
    void testMap() {
        ResponseEntity<String> response = get("/map");

        assertEquals(200, response.getStatusCode().value());

        List<Object> points = JsonPath.parse(response.getBody()).read("$", List.class);
        assertNotNull(points, "map must return an array");
    }

    private ResponseEntity<String> get(String path) {
        return restClient.get()
                .uri(path)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> { })
                .toEntity(String.class);
    }
}
