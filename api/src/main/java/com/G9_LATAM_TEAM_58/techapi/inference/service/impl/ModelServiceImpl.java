package com.G9_LATAM_TEAM_58.techapi.inference.service.impl;

import com.G9_LATAM_TEAM_58.techapi.inference.client.IInferenceClient;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.ModelInfoResponse;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.ModelResponse;
import com.G9_LATAM_TEAM_58.techapi.inference.service.IModelService;
import org.springframework.stereotype.Service;

@Service
public class ModelServiceImpl implements IModelService {

    private final IInferenceClient inferenceClient;

    public ModelServiceImpl(IInferenceClient inferenceClient) {
        this.inferenceClient = inferenceClient;
    }

    @Override
    public ModelResponse getModelInfo() {
        ModelInfoResponse info = inferenceClient.getModelInfo();

        ModelResponse response = new ModelResponse();
        response.setVersion(info.getVersion());
        response.setEmbeddingModel(info.getEmbeddingModel());
        response.setDim(info.getDim());

        if (info.getMetrics() != null && info.getMetrics().containsKey("embedding_macro_f1_es")) {
            response.setMacroF1(info.getMetrics().get("embedding_macro_f1_es"));
        }

        return response;
    }
}
