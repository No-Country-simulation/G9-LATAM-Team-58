package com.G9_LATAM_TEAM_58.techapi.unit.controller;

import com.G9_LATAM_TEAM_58.techapi.core.service.IKeywordSearchService;
import com.G9_LATAM_TEAM_58.techapi.inference.controller.SearchController;
import com.G9_LATAM_TEAM_58.techapi.common.dto.SearchResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SearchController.class)
class SearchControllerKeywordUnitTest {

    @Autowired
    private MockMvc mvc;

    // Only the keyword service is mocked: the semantic Optional stays empty.
    @MockitoBean
    private IKeywordSearchService keywordSearchService;

    @Test
    void test200Keyword() throws Exception {
        // The service now returns a full SearchResponse, which the controller
        // delegates directly. The stub carries mode, total and results.
        SearchResponse response = new SearchResponse();
        response.setMode("keyword");
        response.setTotal(42);
        response.setElapsedMs(0);
        response.setResults(List.of());

        when(keywordSearchService.search(eq("test"), any(), anyInt(), anyInt()))
                .thenReturn(response);

        mvc.perform(get("/search").param("q", "test").param("mode", "keyword"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mode").value("keyword"))
                .andExpect(jsonPath("$.total").value(42))
                .andExpect(jsonPath("$.results.length()").value(0));
    }
}
