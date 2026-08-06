package com.G9_LATAM_TEAM_58.techapi.unit.controller;

import com.G9_LATAM_TEAM_58.techapi.common.controller.HealthController;
import com.G9_LATAM_TEAM_58.techapi.inference.client.IInferenceClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HealthController.class)
class HealthControllerUnitTest {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private IInferenceClient inferenceClient;

    @MockitoBean
    private JdbcTemplate jdbcTemplate;

    @Test
    void testUp() throws Exception {
        when(inferenceClient.isReachable()).thenReturn(true);
        when(jdbcTemplate.queryForObject(eq("SELECT 1 FROM DUAL"), eq(Integer.class))).thenReturn(1);

        mvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.dependencies.length()").value(2));
    }

    @Test
    void testDegraded() throws Exception {
        // Inference probe fails; the mocked JdbcTemplate returns null for the
        // probe (Mockito default), so the database probe is unreachable too.
        // The endpoint stays HTTP 200 and reports DEGRADED.
        when(inferenceClient.isReachable()).thenReturn(false);

        mvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DEGRADED"))
                .andExpect(jsonPath("$.dependencies.length()").value(2));
    }
}
