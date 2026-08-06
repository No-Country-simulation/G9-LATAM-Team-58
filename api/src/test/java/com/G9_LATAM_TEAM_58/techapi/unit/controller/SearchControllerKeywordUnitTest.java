package com.G9_LATAM_TEAM_58.techapi.unit.controller;

import com.G9_LATAM_TEAM_58.techapi.core.service.IKeywordSearchService;
import com.G9_LATAM_TEAM_58.techapi.inference.controller.SearchController;
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
        // EXPLICIT stub: the controller builds the response from
        // results.size(), so the mock must return a real (non-null) list
        // instead of relying on Mockito's empty default (which would NPE).
        when(keywordSearchService.search(eq("test"), any(), anyInt(), anyInt()))
                .thenReturn(List.of());

        mvc.perform(get("/search").param("q", "test").param("mode", "keyword"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mode").value("keyword"))
                .andExpect(jsonPath("$.total").value(0))
                .andExpect(jsonPath("$.results.length()").value(0));
    }
}
