package com.G9_LATAM_TEAM_58.techapi.unit.controller;

import com.G9_LATAM_TEAM_58.techapi.inference.controller.SearchController;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.SearchResponse;
import com.G9_LATAM_TEAM_58.techapi.inference.service.ISemanticSearchService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static com.G9_LATAM_TEAM_58.techapi.unit.controller.SharedTestAssertions.assertApiError;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SearchController.class)
class SearchControllerSemanticUnitTest {

    @Autowired
    private MockMvc mvc;

    // Only the semantic service is mocked: the keyword Optional stays empty.
    @MockitoBean
    private ISemanticSearchService semanticSearchService;

    private SearchResponse buildSemanticResponse() {
        SearchResponse response = new SearchResponse();
        response.setMode("semantic");
        response.setTotal(1);
        response.setElapsedMs(42);
        response.setResults(List.of());
        return response;
    }

    @Test
    void test200Semantic() throws Exception {
        when(semanticSearchService.search(eq("test"), any(), anyInt(), anyInt()))
                .thenReturn(buildSemanticResponse());

        mvc.perform(get("/search").param("q", "test").param("mode", "semantic"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mode").value("semantic"))
                .andExpect(jsonPath("$.total").value(1));
    }

    @Test
    void testInvalidMode() throws Exception {
        MvcResult result = mvc.perform(get("/search").param("q", "test").param("mode", "invalid"))
                .andExpect(status().isBadRequest())
                .andReturn();

        assertApiError(result, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
    }

    @Test
    void testEmptyQ() throws Exception {
        MvcResult result = mvc.perform(get("/search").param("q", "").param("mode", "semantic"))
                .andExpect(status().isBadRequest())
                .andReturn();

        assertApiError(result, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
    }
}
