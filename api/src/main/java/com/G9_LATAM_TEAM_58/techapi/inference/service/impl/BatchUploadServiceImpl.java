package com.G9_LATAM_TEAM_58.techapi.inference.service.impl;

import com.G9_LATAM_TEAM_58.techapi.common.exception.ValidationException;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.BatchUploadError;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.BatchUploadResponse;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.ContentIngestionRequest;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.ContentIngestionResponse;
import com.G9_LATAM_TEAM_58.techapi.inference.service.IBatchUploadService;
import com.G9_LATAM_TEAM_58.techapi.inference.service.IContentIngestionService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
@ConditionalOnProperty(name = "app.database.enabled", havingValue = "true")
public class BatchUploadServiceImpl implements IBatchUploadService {

    /**
     * Ceiling on data rows per upload. Every row costs one inference call, so
     * without a cap a single anonymous 5MB CSV could queue thousands of them and
     * starve the service for everyone else. The multipart size limit alone does
     * not bound the work: short rows are cheap to send and expensive to process.
     *
     * <p>The web mirrors this number in batch-upload/constants.ts so the user
     * gets an instant local error instead of a wasted upload; keep them in sync.
     * Blank lines are excluded from the count on both sides (papaparse runs with
     * skipEmptyLines), otherwise a trailing newline on a 200-row file would pass
     * the local check and get rejected here.
     */
    private static final int MAX_ROWS = 200;

    private final IContentIngestionService contentIngestionService;

    public BatchUploadServiceImpl(IContentIngestionService contentIngestionService) {
        this.contentIngestionService = contentIngestionService;
    }

    @Override
    public BatchUploadResponse processBatch(MultipartFile file) {
        List<BatchUploadError> errors = new ArrayList<>();
        List<String> ids = new ArrayList<>();
        Map<String, Long> byCategory = new HashMap<>();
        int rowNum = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String header = reader.readLine();
            if (header == null) {
                BatchUploadResponse response = new BatchUploadResponse();
                response.setProcessed(0);
                response.setFailed(0);
                response.setIds(Collections.emptyList());
                response.setErrors(Collections.emptyList());
                response.setByCategory(Collections.emptyMap());
                return response;
            }

            // Collect before ingesting: the cap has to reject the upload whole.
            // Checking mid-loop would leave the first MAX_ROWS rows already
            // persisted behind a 400, which is worse than not starting.
            List<String> rows = new ArrayList<>();
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) {
                    continue;
                }
                rows.add(line);
            }

            if (rows.size() > MAX_ROWS) {
                throw new ValidationException(
                    "El archivo tiene " + rows.size() + " filas y el máximo es " + MAX_ROWS
                    + ". Divídelo en varios archivos."
                );
            }

            for (String row : rows) {
                rowNum++;
                String[] parts = parseCsvLine(row);
                if (parts.length < 2) {
                    errors.add(new BatchUploadError(rowNum, "Línea inválida: se esperaban 2 columnas (title,body)"));
                    continue;
                }

                String title = parts[0].trim();
                String body = parts[1].trim();
                if (title.isEmpty() || body.isEmpty()) {
                    errors.add(new BatchUploadError(rowNum, "Título y cuerpo no pueden estar vacíos"));
                    continue;
                }

                try {
                    ContentIngestionRequest request = new ContentIngestionRequest();
                    request.setTitle(title);
                    request.setBody(body);

                    ContentIngestionResponse result = contentIngestionService.ingest(request);
                    ids.add(result.getId());

                    String cat = result.getCategory();
                    byCategory.merge(cat, 1L, Long::sum);
                } catch (Exception e) {
                    errors.add(new BatchUploadError(rowNum, e.getMessage() != null ? e.getMessage() : "Error al procesar fila"));
                }
            }
        } catch (ValidationException e) {
            // Must escape this catch-all: it is a rejected upload (400), not a
            // bad row to report inside a 200 response.
            throw e;
        } catch (Exception e) {
            errors.add(new BatchUploadError(rowNum + 1, "Error de lectura: " + e.getMessage()));
        }

        BatchUploadResponse response = new BatchUploadResponse();
        response.setProcessed(ids.size());
        response.setFailed(errors.size());
        response.setIds(ids);
        response.setErrors(errors);
        response.setByCategory(byCategory);
        return response;
    }

    private String[] parseCsvLine(String line) {
        List<String> fields = new ArrayList<>();
        boolean inQuotes = false;
        StringBuilder current = new StringBuilder();

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                fields.add(current.toString());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        fields.add(current.toString());
        return fields.toArray(new String[0]);
    }
}
