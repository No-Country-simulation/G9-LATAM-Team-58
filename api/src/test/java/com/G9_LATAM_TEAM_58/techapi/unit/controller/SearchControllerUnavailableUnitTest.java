package com.G9_LATAM_TEAM_58.techapi.unit.controller;

import com.G9_LATAM_TEAM_58.techapi.inference.controller.SearchController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static com.G9_LATAM_TEAM_58.techapi.unit.controller.SharedTestAssertions.assertApiError;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SearchController.class)
class SearchControllerUnavailableUnitTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void testSemanticScaffold503() throws Exception {
        // No search service mocks -> both Optionals empty -> 503.
        MvcResult result = mvc.perform(get("/search").param("q", "test").param("mode", "semantic"))
                .andExpect(status().isServiceUnavailable())
                .andReturn();

        assertApiError(result, HttpStatus.SERVICE_UNAVAILABLE, "INTERNAL_ERROR");
    }

    @Test
    void testKeywordScaffold503() throws Exception {
        MvcResult result = mvc.perform(get("/search").param("q", "test").param("mode", "keyword"))
                .andExpect(status().isServiceUnavailable())
                .andReturn();

        assertApiError(result, HttpStatus.SERVICE_UNAVAILABLE, "INTERNAL_ERROR");
    }
}
