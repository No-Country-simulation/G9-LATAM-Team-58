package com.G9_LATAM_TEAM_58.techapi.core.service;

import com.G9_LATAM_TEAM_58.techapi.common.dto.CorpusSeedRequest;
import com.G9_LATAM_TEAM_58.techapi.common.dto.CorpusSeedResponse;

public interface ICorpusSeedService {
    CorpusSeedResponse seed(CorpusSeedRequest request);
}
