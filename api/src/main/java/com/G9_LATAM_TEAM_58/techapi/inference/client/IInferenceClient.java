package com.G9_LATAM_TEAM_58.techapi.inference.client;

import com.G9_LATAM_TEAM_58.techapi.inference.dto.EmbedResponse;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.ModelInfoResponse;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.PredictResponse;

public interface IInferenceClient {
    PredictResponse predict(String text);
    EmbedResponse embed(String text, String type);
    ModelInfoResponse getModelInfo();
}
