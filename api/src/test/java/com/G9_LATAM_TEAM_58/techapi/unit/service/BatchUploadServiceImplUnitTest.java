package com.G9_LATAM_TEAM_58.techapi.unit.service;

import com.G9_LATAM_TEAM_58.techapi.common.exception.ValidationException;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.ContentIngestionResponse;
import com.G9_LATAM_TEAM_58.techapi.inference.service.IContentIngestionService;
import com.G9_LATAM_TEAM_58.techapi.inference.service.impl.BatchUploadServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BatchUploadServiceImplUnitTest {

    private static final int MAX_ROWS = 200;

    private static MultipartFile csvWithRows(int rows) {
        StringBuilder csv = new StringBuilder("title,body\n");
        for (int i = 0; i < rows; i++) {
            csv.append("Titulo ").append(i).append(",Cuerpo ").append(i).append('\n');
        }
        return new MockMultipartFile("file", "corpus.csv", "text/csv",
                csv.toString().getBytes(StandardCharsets.UTF_8));
    }

    private static IContentIngestionService ingestionReturningIds() {
        IContentIngestionService ingestion = mock(IContentIngestionService.class);
        ContentIngestionResponse result = new ContentIngestionResponse();
        result.setId("generated-id");
        result.setCategory("Backend");
        when(ingestion.ingest(any())).thenReturn(result);
        return ingestion;
    }

    @Test
    void acceptsAFileExactlyAtTheRowCap() {
        IContentIngestionService ingestion = ingestionReturningIds();
        BatchUploadServiceImpl service = new BatchUploadServiceImpl(ingestion);

        assertEquals(MAX_ROWS, service.processBatch(csvWithRows(MAX_ROWS)).getProcessed());
    }

    @Test
    void rejectsAFileOverTheRowCap() {
        IContentIngestionService ingestion = ingestionReturningIds();
        BatchUploadServiceImpl service = new BatchUploadServiceImpl(ingestion);

        ValidationException error = assertThrows(ValidationException.class,
                () -> service.processBatch(csvWithRows(MAX_ROWS + 1)));

        // The message names both numbers: "too many rows" alone leaves the user
        // guessing how much to split the file by.
        assertTrue(error.getMessage().contains(String.valueOf(MAX_ROWS + 1)));
        assertTrue(error.getMessage().contains(String.valueOf(MAX_ROWS)));
    }

    @Test
    void ingestsNothingWhenTheFileIsRejected() {
        IContentIngestionService ingestion = ingestionReturningIds();
        BatchUploadServiceImpl service = new BatchUploadServiceImpl(ingestion);

        assertThrows(ValidationException.class, () -> service.processBatch(csvWithRows(MAX_ROWS + 1)));

        // The whole point of counting before ingesting: an over-cap upload must
        // not leave the first 200 rows persisted behind a 400.
        verify(ingestion, never()).ingest(any());
    }
}
