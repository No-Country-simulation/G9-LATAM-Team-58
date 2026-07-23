package com.G9_LATAM_TEAM_58.techapi.inference.service.impl;

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

            String line;
            while ((line = reader.readLine()) != null) {
                rowNum++;
                String[] parts = parseCsvLine(line);
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
