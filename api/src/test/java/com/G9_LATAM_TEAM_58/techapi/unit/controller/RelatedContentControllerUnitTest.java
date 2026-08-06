package com.G9_LATAM_TEAM_58.techapi.unit.controller;

import com.G9_LATAM_TEAM_58.techapi.common.exception.NotFoundException;
import com.G9_LATAM_TEAM_58.techapi.core.controller.RelatedContentController;
import com.G9_LATAM_TEAM_58.techapi.core.dto.RelatedContentResponse;
import com.G9_LATAM_TEAM_58.techapi.core.service.IRelatedContentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static com.G9_LATAM_TEAM_58.techapi.unit.controller.SharedTestAssertions.assertApiError;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RelatedContentController.class)
class RelatedContentControllerUnitTest {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private IRelatedContentService relatedContentService;

    @Test
    void test200() throws Exception {
        RelatedContentResponse response = new RelatedContentResponse();
        response.setId("so-32472760");
        response.setTitle("Ejemplo");
        response.setRelated(List.of());

        when(relatedContentService.getRelated("so-32472760", 5)).thenReturn(response);

        mvc.perform(get("/contents/so-32472760/related").param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("so-32472760"))
                .andExpect(jsonPath("$.related.length()").value(0));
    }

    @Test
    void test404() throws Exception {
        when(relatedContentService.getRelated("so-32472760", 5))
                .thenThrow(new NotFoundException("no"));

        MvcResult result = mvc.perform(get("/contents/so-32472760/related").param("limit", "5"))
                .andExpect(status().isNotFound())
                .andReturn();

        assertApiError(result, HttpStatus.NOT_FOUND, "NOT_FOUND");
    }
}
