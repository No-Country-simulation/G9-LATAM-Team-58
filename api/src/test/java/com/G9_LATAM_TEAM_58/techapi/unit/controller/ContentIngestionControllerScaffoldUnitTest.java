package com.G9_LATAM_TEAM_58.techapi.unit.controller;

import com.G9_LATAM_TEAM_58.techapi.inference.controller.ContentIngestionController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static com.G9_LATAM_TEAM_58.techapi.unit.controller.SharedTestAssertions.assertApiError;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ContentIngestionController.class)
class ContentIngestionControllerScaffoldUnitTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void testScaffold503() throws Exception {
        // No IContentIngestionService mock -> Optional empty -> 503. The body
        // must pass @Valid so execution reaches the scaffold (null service) branch.
        MvcResult result = mvc.perform(post("/content")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title": "Ejemplo", "body": "Cuerpo del documento"}
                                """))
                .andExpect(status().isServiceUnavailable())
                .andReturn();

        assertApiError(result, HttpStatus.SERVICE_UNAVAILABLE, "INTERNAL_ERROR");
    }
}
