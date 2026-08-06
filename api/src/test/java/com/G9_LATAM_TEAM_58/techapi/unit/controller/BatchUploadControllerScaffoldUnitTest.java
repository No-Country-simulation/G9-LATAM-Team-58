package com.G9_LATAM_TEAM_58.techapi.unit.controller;

import com.G9_LATAM_TEAM_58.techapi.inference.controller.BatchUploadController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.charset.StandardCharsets;

import static com.G9_LATAM_TEAM_58.techapi.unit.controller.SharedTestAssertions.assertApiError;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BatchUploadController.class)
class BatchUploadControllerScaffoldUnitTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void testScaffold503() throws Exception {
        // No IBatchUploadService mock -> Optional empty -> 503. The file must
        // be non-empty and end in .csv to pass controller validation and reach
        // the scaffold (null service) branch.
        MockMultipartFile file = new MockMultipartFile(
                "file", "contents.csv", "text/csv",
                "id,title\n1,Java".getBytes(StandardCharsets.UTF_8));

        MvcResult result = mvc.perform(multipart("/contents/batch").file(file))
                .andExpect(status().isServiceUnavailable())
                .andReturn();

        assertApiError(result, HttpStatus.SERVICE_UNAVAILABLE, "INTERNAL_ERROR");
    }
}
