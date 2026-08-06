package com.G9_LATAM_TEAM_58.techapi.unit.controller;

import com.G9_LATAM_TEAM_58.techapi.core.controller.StatsController;
import com.G9_LATAM_TEAM_58.techapi.core.dto.StatsResponse;
import com.G9_LATAM_TEAM_58.techapi.core.service.IStatsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(StatsController.class)
class StatsControllerUnitTest {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private IStatsService statsService;

    @Test
    void test200() throws Exception {
        StatsResponse response = new StatsResponse();
        response.setTotal(10);
        response.setByCategory(Map.of("java", 5L));
        response.setAddedThisWeek(2);

        when(statsService.getStats()).thenReturn(response);

        mvc.perform(get("/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(10))
                .andExpect(jsonPath("$.byCategory.java").value(5))
                .andExpect(jsonPath("$.addedThisWeek").value(2));
    }
}
