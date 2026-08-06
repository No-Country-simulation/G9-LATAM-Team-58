package com.G9_LATAM_TEAM_58.techapi.unit.controller;

import com.G9_LATAM_TEAM_58.techapi.common.controller.HealthController;
import com.G9_LATAM_TEAM_58.techapi.inference.client.IInferenceClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HealthController.class)
class HealthControllerScaffoldUnitTest {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private IInferenceClient inferenceClient;

    @Test
    void testUpWithDatabaseDisabled() throws Exception {
        // NOTE: @WebMvcTest does not auto-configure a JdbcTemplate bean, so the
        // Optional<JdbcTemplate> dependency is empty in this slice and the
        // database dependency reports enabled=false. With the inference probe
        // healthy, up = true && (false || !false) => the endpoint is UP.
        when(inferenceClient.isReachable()).thenReturn(true);

        mvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.dependencies.length()").value(2))
                .andExpect(jsonPath("$.dependencies[1].enabled").value(false));
    }
}
