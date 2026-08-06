package com.G9_LATAM_TEAM_58.techapi.inference.client;

import com.G9_LATAM_TEAM_58.techapi.common.exception.InferenceException;
import com.G9_LATAM_TEAM_58.techapi.common.exception.InferenceUnavailableException;
import com.G9_LATAM_TEAM_58.techapi.common.exception.ValidationException;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.EmbedRequest;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.EmbedResponse;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.ModelInfoResponse;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.PredictRequest;
import com.G9_LATAM_TEAM_58.techapi.inference.dto.PredictResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class InferenceClientImpl implements IInferenceClient {

    private static final Logger log = LoggerFactory.getLogger(InferenceClientImpl.class);

    private final RestClient restClient;

    public InferenceClientImpl(RestClient inferenceRestClient) {
        this.restClient = inferenceRestClient;
    }

    @Override
    public boolean isReachable() {
        try {
            restClient.get()
                    .uri("/health")
                    .retrieve()
                    .toBodilessEntity();
            return true;
        } catch (Exception e) {
            if (isInterruption(e)) {
                Thread.currentThread().interrupt();
                return false;
            }
            // Probe failures are expected when the inference service is down; DEBUG
            // keeps every health check from flooding WARN logs.
            log.debug("Inference health check failed: {}", rootMessage(e));
            return false;
        }
    }

    @Override
    public PredictResponse predict(String text) {
        log.debug("predict request text={}", truncate(text, 50));
        long start = System.currentTimeMillis();
        try {
            ResponseEntity<PredictResponse> entity = restClient.post()
                    .uri("/predict")
                    .body(new PredictRequest(text))
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                        // Mapped exceptions are thrown here WITHOUT logging: the
                        // GlobalExceptionHandler logs them, so logging here would double-log.
                        throw new ValidationException("Error en el servicio de inferencia: " + res.getStatusText());
                    })
                    .onStatus(status -> status.value() == 503, (req, res) -> {
                        throw new InferenceUnavailableException("El modelo de inferencia no está disponible");
                    })
                    .onStatus(HttpStatusCode::is5xxServerError, (req, res) -> {
                        throw new InferenceException("Error en el servicio de inferencia: " + res.getStatusText());
                    })
                    .toEntity(PredictResponse.class);
            log.info("predict response status={} ms={}", entity.getStatusCode().value(), System.currentTimeMillis() - start);
            return entity.getBody();
        } catch (RestClientException e) {
            // Only unexpected client failures land here (network, body mapping...).
            // A network-level failure means the inference service is unreachable → 503.
            // The GlobalExceptionHandler owns the ERROR log; DEBUG keeps an inference
            // outage from flooding the logs with duplicate full stack traces.
            log.debug("predict failed", e);
            throw new InferenceUnavailableException("Inference service unavailable: " + rootMessage(e));
        }
    }

    @Override
    public EmbedResponse embed(String text, String type) {
        log.debug("embed request text={} type={}", truncate(text, 50), type);
        long start = System.currentTimeMillis();
        try {
            ResponseEntity<EmbedResponse> entity = restClient.post()
                    .uri("/embed")
                    .body(new EmbedRequest(text, type))
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                        // See predict(): mapped exceptions are thrown unlogged to avoid double-logging.
                        throw new ValidationException("Error en el servicio de inferencia: " + res.getStatusText());
                    })
                    .onStatus(status -> status.value() == 503, (req, res) -> {
                        throw new InferenceUnavailableException("El modelo de inferencia no está disponible");
                    })
                    .onStatus(HttpStatusCode::is5xxServerError, (req, res) -> {
                        throw new InferenceException("Error en el servicio de inferencia: " + res.getStatusText());
                    })
                    .toEntity(EmbedResponse.class);
            log.info("embed response status={} ms={}", entity.getStatusCode().value(), System.currentTimeMillis() - start);
            return entity.getBody();
        } catch (RestClientException e) {
            // See predict(): network-level failures surface as 503, logged at DEBUG.
            log.debug("embed failed", e);
            throw new InferenceUnavailableException("Inference service unavailable: " + rootMessage(e));
        }
    }

    @Override
    public ModelInfoResponse getModelInfo() {
        log.debug("getModelInfo request");
        long start = System.currentTimeMillis();
        try {
            ResponseEntity<ModelInfoResponse> entity = restClient.get()
                    .uri("/model/info")
                    .retrieve()
                    .onStatus(HttpStatusCode::is5xxServerError, (req, res) -> {
                        // See predict(): mapped exceptions are thrown unlogged to avoid double-logging.
                        throw new InferenceException("Error al consultar información del modelo: " + res.getStatusText());
                    })
                    .toEntity(ModelInfoResponse.class);
            log.info("getModelInfo response status={} ms={}", entity.getStatusCode().value(), System.currentTimeMillis() - start);
            return entity.getBody();
        } catch (RestClientException e) {
            // See predict(): network-level failures surface as 503, logged at DEBUG.
            log.debug("getModelInfo failed", e);
            throw new InferenceUnavailableException("Inference service unavailable: " + rootMessage(e));
        }
    }

    private String truncate(String s, int max) {
        if (s == null || s.length() <= max) {
            return s;
        }
        return s.substring(0, max) + "...";
    }

    private String rootMessage(Throwable t) {
        Throwable current = t;
        while (current != null && current.getMessage() == null) {
            current = current.getCause();
        }
        return current != null ? current.getMessage() : t.getClass().getSimpleName();
    }

    private boolean isInterruption(Throwable t) {
        for (Throwable current = t; current != null; current = current.getCause()) {
            if (current instanceof InterruptedException) {
                return true;
            }
        }
        return false;
    }
}
