package com.G9_LATAM_TEAM_58.techapi.unit.controller;

import com.G9_LATAM_TEAM_58.techapi.common.dto.CorpusSeedRequest;
import com.G9_LATAM_TEAM_58.techapi.common.dto.CorpusSeedResponse;
import com.G9_LATAM_TEAM_58.techapi.core.controller.SeedController;
import com.G9_LATAM_TEAM_58.techapi.core.service.ICorpusSeedService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SeedController.class)
class SeedControllerUnitTest {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private ICorpusSeedService corpusSeedService;

    private static final String VALID_BODY = """
            {
              "documents": [
                {
                  "id": "doc-1",
                  "title": "Documento 1",
                  "category": "java",
                  "embedding": [0.1, 0.2]
                }
              ]
            }
            """;

    @Test
    void test200() throws Exception {
        CorpusSeedResponse response = new CorpusSeedResponse();
        response.setProcessed(1);
        response.setFailed(0);
        response.setSkipped(0);
        response.setIds(List.of("doc-1"));
        response.setErrors(List.of());

        when(corpusSeedService.seed(any(CorpusSeedRequest.class))).thenReturn(response);

        mvc.perform(post("/admin/seed")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.processed").value(1))
                .andExpect(jsonPath("$.failed").value(0))
                .andExpect(jsonPath("$.ids[0]").value("doc-1"));
    }
}
