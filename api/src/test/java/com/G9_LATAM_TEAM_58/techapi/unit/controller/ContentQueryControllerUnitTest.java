package com.G9_LATAM_TEAM_58.techapi.unit.controller;

import com.G9_LATAM_TEAM_58.techapi.common.exception.NotFoundException;
import com.G9_LATAM_TEAM_58.techapi.core.controller.ContentQueryController;
import com.G9_LATAM_TEAM_58.techapi.core.dto.ContentDetail;
import com.G9_LATAM_TEAM_58.techapi.core.dto.ContentListResponse;
import com.G9_LATAM_TEAM_58.techapi.core.service.IContentQueryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static com.G9_LATAM_TEAM_58.techapi.unit.controller.SharedTestAssertions.assertApiError;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ContentQueryController.class)
class ContentQueryControllerUnitTest {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private IContentQueryService contentQueryService;

    @Test
    void testList() throws Exception {
        // listContents(category, q, sort, page, size): the controller passes
        // null for the optional category/q params, so use nullable(String.class)
        // matchers for those arguments.
        when(contentQueryService.listContents(
                nullable(String.class), nullable(String.class), nullable(String.class), anyInt(), anyInt()))
                .thenReturn(new ContentListResponse(0, List.of()));

        mvc.perform(get("/contents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(0))
                .andExpect(jsonPath("$.items.length()").value(0));
    }

    @Test
    void testDetail() throws Exception {
        ContentDetail detail = new ContentDetail();
        detail.setId("so-32472760");
        detail.setTitle("Ejemplo");
        detail.setCategory("java");
        when(contentQueryService.getContentById("so-32472760")).thenReturn(detail);

        mvc.perform(get("/contents/so-32472760"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("so-32472760"))
                .andExpect(jsonPath("$.title").value("Ejemplo"));
    }

    @Test
    void testRejectsOversizedPage() throws Exception {
        // Used to be accepted verbatim and handed to the database as a single
        // page over the whole table.
        MvcResult result = mvc.perform(get("/contents").param("size", "1000000"))
                .andExpect(status().isBadRequest())
                .andReturn();

        assertApiError(result, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
    }

    @Test
    void testNotFound() throws Exception {
        when(contentQueryService.getContentById(anyString()))
                .thenThrow(new NotFoundException("no"));

        MvcResult result = mvc.perform(get("/contents/so-32472760"))
                .andExpect(status().isNotFound())
                .andReturn();

        assertApiError(result, HttpStatus.NOT_FOUND, "NOT_FOUND");
    }
}
