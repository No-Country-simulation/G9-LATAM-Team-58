package com.G9_LATAM_TEAM_58.techapi.unit.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * Shared assertions for controller unit tests.
 *
 * <p>ApiError bodies are serialized as {@code {error, message, timestamp}}:
 * this helper verifies the HTTP status plus the {@code error} code and that
 * both {@code message} and {@code timestamp} are present and non-blank.
 */
public final class SharedTestAssertions {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private SharedTestAssertions() {
        // Utility class: no instantiation allowed.
    }

    /**
     * Asserts that the response produced by {@code result} is an ApiError with
     * the expected HTTP status and error code, and that {@code message} and
     * {@code timestamp} are non-blank strings.
     *
     * @param result    the MockMvc result to inspect
     * @param status    the expected HTTP status
     * @param errorCode the expected {@code error} code in the JSON body
     * @throws Exception if the response body cannot be parsed as JSON
     */
    public static void assertApiError(MvcResult result, HttpStatus status, String errorCode) throws Exception {
        assertEquals(status.value(), result.getResponse().getStatus(),
                "HTTP status must match " + status);

        JsonNode root = OBJECT_MAPPER.readTree(result.getResponse().getContentAsString());

        JsonNode error = root.get("error");
        assertNotNull(error, "ApiError body must expose 'error'");
        assertEquals(errorCode, error.asText(), "ApiError error code must match");

        JsonNode message = root.get("message");
        assertNotNull(message, "ApiError body must expose 'message'");
        assertFalse(message.asText().isBlank(), "ApiError message must not be blank");

        JsonNode timestamp = root.get("timestamp");
        assertNotNull(timestamp, "ApiError body must expose 'timestamp'");
        assertFalse(timestamp.asText().isBlank(), "ApiError timestamp must not be blank");
    }
}
