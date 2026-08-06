package com.G9_LATAM_TEAM_58.techapi.unit.controller;

import com.G9_LATAM_TEAM_58.techapi.inference.controller.BatchUploadController;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.BatchUploadResponse;
import com.G9_LATAM_TEAM_58.techapi.inference.service.IBatchUploadService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import static com.G9_LATAM_TEAM_58.techapi.unit.controller.SharedTestAssertions.assertApiError;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BatchUploadController.class)
class BatchUploadControllerUnitTest {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private IBatchUploadService batchUploadService;

    @Test
    void test200CsvUpload() throws Exception {
        BatchUploadResponse response = new BatchUploadResponse();
        response.setProcessed(2);
        response.setFailed(0);
        response.setIds(List.of("id-1", "id-2"));
        response.setErrors(List.of());
        response.setByCategory(Map.of("java", 2L));

        when(batchUploadService.processBatch(any(MultipartFile.class))).thenReturn(response);

        MockMultipartFile file = new MockMultipartFile(
                "file", "contents.csv", "text/csv",
                "id,title\n1,Java\n2,Spring".getBytes(StandardCharsets.UTF_8));

        mvc.perform(multipart("/contents/batch").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.processed").value(2))
                .andExpect(jsonPath("$.ids.length()").value(2));
    }

    @Test
    void testEmptyFileRejected() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "contents.csv", "text/csv", new byte[0]);

        MvcResult result = mvc.perform(multipart("/contents/batch").file(file))
                .andExpect(status().isBadRequest())
                .andReturn();

        assertApiError(result, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
    }

    @Test
    void testNonCsvRejected() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "data.txt", "text/plain",
                "id,title\n1,Java".getBytes(StandardCharsets.UTF_8));

        MvcResult result = mvc.perform(multipart("/contents/batch").file(file))
                .andExpect(status().isBadRequest())
                .andReturn();

        assertApiError(result, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
    }
}
