package com.G9_LATAM_TEAM_58.techapi.unit.controller;

import com.G9_LATAM_TEAM_58.techapi.inference.controller.ContentIngestionController;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.ContentIngestionRequest;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.ContentIngestionResponse;
import com.G9_LATAM_TEAM_58.techapi.inference.service.IContentIngestionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static com.G9_LATAM_TEAM_58.techapi.unit.controller.SharedTestAssertions.assertApiError;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ContentIngestionController.class)
class ContentIngestionControllerUnitTest {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private IContentIngestionService contentIngestionService;

    @Test
    void test201() throws Exception {
        ContentIngestionResponse response = new ContentIngestionResponse();
        response.setId("c-1");
        response.setCategory("java");
        response.setProbability(0.99);
        response.setKeywords(List.of("java"));
        response.setRelated(List.of());
        response.setExplanation(List.of());

        when(contentIngestionService.ingest(any(ContentIngestionRequest.class))).thenReturn(response);

        mvc.perform(post("/content")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title": "Ejemplo", "body": "Cuerpo del documento"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("c-1"))
                .andExpect(jsonPath("$.category").value("java"));
    }

    @Test
    void test400BlankTitle() throws Exception {
        // @NotBlank on title -> MethodArgumentNotValidException -> 400.
        MvcResult result = mvc.perform(post("/content")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title": "", "body": "Cuerpo del documento"}
                                """))
                .andExpect(status().isBadRequest())
                .andReturn();

        assertApiError(result, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
    }
}
