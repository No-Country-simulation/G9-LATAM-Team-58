package com.G9_LATAM_TEAM_58.techapi.inference.client;

import com.G9_LATAM_TEAM_58.techapi.common.exception.InferenceException;
import com.G9_LATAM_TEAM_58.techapi.common.exception.InferenceUnavailableException;
import com.G9_LATAM_TEAM_58.techapi.common.exception.ValidationException;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.EmbedRequest;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.EmbedResponse;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.ModelInfoResponse;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.PredictRequest;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.PredictResponse;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class InferenceClientImpl implements IInferenceClient {

    private final RestClient restClient;

    public InferenceClientImpl(RestClient inferenceRestClient) {
        this.restClient = inferenceRestClient;
    }

    @Override
    public PredictResponse predict(String text) {
        return restClient.post()
                .uri("/predict")
                .body(new PredictRequest(text))
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                    throw new ValidationException("Error en el servicio de inferencia: " + res.getStatusText());
                })
                .onStatus(status -> status.value() == 503, (req, res) -> {
                    throw new InferenceUnavailableException("El modelo de inferencia no está disponible");
                })
                .onStatus(HttpStatusCode::is5xxServerError, (req, res) -> {
                    throw new InferenceException("Error en el servicio de inferencia: " + res.getStatusText());
                })
                .body(PredictResponse.class);
    }

    @Override
    public EmbedResponse embed(String text, String type) {
        return restClient.post()
                .uri("/embed")
                .body(new EmbedRequest(text, type))
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                    throw new ValidationException("Error en el servicio de inferencia: " + res.getStatusText());
                })
                .onStatus(status -> status.value() == 503, (req, res) -> {
                    throw new InferenceUnavailableException("El modelo de inferencia no está disponible");
                })
                .onStatus(HttpStatusCode::is5xxServerError, (req, res) -> {
                    throw new InferenceException("Error en el servicio de inferencia: " + res.getStatusText());
                })
                .body(EmbedResponse.class);
    }

    @Override
    public ModelInfoResponse getModelInfo() {
        return restClient.get()
                .uri("/model/info")
                .retrieve()
                .onStatus(HttpStatusCode::is5xxServerError, (req, res) -> {
                    throw new InferenceException("Error al consultar información del modelo: " + res.getStatusText());
                })
                .body(ModelInfoResponse.class);
    }
}
