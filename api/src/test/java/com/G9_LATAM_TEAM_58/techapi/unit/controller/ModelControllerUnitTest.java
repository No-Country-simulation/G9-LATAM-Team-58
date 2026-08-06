package com.G9_LATAM_TEAM_58.techapi.unit.controller;

import com.G9_LATAM_TEAM_58.techapi.common.exception.InferenceUnavailableException;
import com.G9_LATAM_TEAM_58.techapi.common.exception.ValidationException;
import com.G9_LATAM_TEAM_58.techapi.inference.controller.ModelController;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.ModelResponse;
import com.G9_LATAM_TEAM_58.techapi.inference.service.IModelService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static com.G9_LATAM_TEAM_58.techapi.unit.controller.SharedTestAssertions.assertApiError;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ModelController.class)
class ModelControllerUnitTest {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private IModelService modelService;

    private ModelResponse buildResponse() {
        // ModelResponse has only @Getter/@Setter: use the no-arg constructor
        // and setters to populate it.
        ModelResponse response = new ModelResponse();
        response.setDim(384);
        response.setEmbeddingModel("intfloat/multilingual-e5-small");
        response.setMacroF1(0.8794);
        response.setVersion("v1");
        return response;
    }

    @Test
    void test200() throws Exception {
        when(modelService.getModelInfo()).thenReturn(buildResponse());

        mvc.perform(get("/model"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dim").value(384))
                .andExpect(jsonPath("$.embeddingModel").value("intfloat/multilingual-e5-small"))
                .andExpect(jsonPath("$.macroF1").value(0.8794))
                .andExpect(jsonPath("$.version").value("v1"));
    }

    @Test
    void test400() throws Exception {
        when(modelService.getModelInfo()).thenThrow(new ValidationException("bad"));

        MvcResult result = mvc.perform(get("/model"))
                .andExpect(status().isBadRequest())
                .andReturn();

        assertApiError(result, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
    }

    @Test
    void test503() throws Exception {
        when(modelService.getModelInfo()).thenThrow(new InferenceUnavailableException("down"));

        MvcResult result = mvc.perform(get("/model"))
                .andExpect(status().isServiceUnavailable())
                .andReturn();

        assertApiError(result, HttpStatus.SERVICE_UNAVAILABLE, "INTERNAL_ERROR");
    }
}
