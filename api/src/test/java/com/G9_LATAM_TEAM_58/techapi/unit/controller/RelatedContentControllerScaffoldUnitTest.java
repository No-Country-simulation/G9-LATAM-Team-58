package com.G9_LATAM_TEAM_58.techapi.unit.controller;

import com.G9_LATAM_TEAM_58.techapi.core.controller.RelatedContentController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static com.G9_LATAM_TEAM_58.techapi.unit.controller.SharedTestAssertions.assertApiError;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RelatedContentController.class)
class RelatedContentControllerScaffoldUnitTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void testRelatedScaffold503() throws Exception {
        // No IRelatedContentService mock -> Optional empty -> 503.
        MvcResult result = mvc.perform(get("/contents/so-32472760/related"))
                .andExpect(status().isServiceUnavailable())
                .andReturn();

        assertApiError(result, HttpStatus.SERVICE_UNAVAILABLE, "INTERNAL_ERROR");
    }
}
