package com.G9_LATAM_TEAM_58.techapi.inference.service;

import com.G9_LATAM_TEAM_58.techapi.inference.dto.BatchUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface BatchUploadService {
    BatchUploadResponse processBatch(MultipartFile file);
}
