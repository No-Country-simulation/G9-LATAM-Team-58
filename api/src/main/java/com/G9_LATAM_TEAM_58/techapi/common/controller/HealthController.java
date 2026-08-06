package com.G9_LATAM_TEAM_58.techapi.common.controller;

import com.G9_LATAM_TEAM_58.techapi.common.dto.HealthResponse;
import com.G9_LATAM_TEAM_58.techapi.inference.client.IInferenceClient;
import io.swagger.v3.oas.annotations.Hidden;
import jakarta.annotation.PreDestroy;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.function.Supplier;

@RestController
@RequestMapping("/health")
@Hidden
public class HealthController {

    private final IInferenceClient inferenceClient;
    private final Optional<JdbcTemplate> jdbcTemplate;

    // Virtual threads are cheap: a hung probe (e.g. a DB blackhole that does not
    // abort socket reads on interrupt) blocks only a carrier thread, never starving
    // later probes or growing an unbounded queue like a single worker thread would.
    private final ExecutorService probeExecutor = Executors.newVirtualThreadPerTaskExecutor();

    public HealthController(IInferenceClient inferenceClient, Optional<JdbcTemplate> jdbcTemplate) {
        this.inferenceClient = inferenceClient;
        this.jdbcTemplate = jdbcTemplate;
    }

    @PreDestroy
    public void shutdown() {
        probeExecutor.shutdownNow();
    }

    @GetMapping
    public HealthResponse health() {
        HealthResponse.DependencyStatus inference = probeInference();
        HealthResponse.DependencyStatus database = probeDatabase();

        boolean up = inference.isReachable() && (database.isReachable() || !database.isEnabled());
        String status = up ? "UP" : "DEGRADED";

        return new HealthResponse(status, Instant.now(), List.of(inference, database));
    }

    private HealthResponse.DependencyStatus probeInference() {
        long start = System.nanoTime();
        boolean reachable;
        String message = null;
        try {
            reachable = withTimeout(inferenceClient::isReachable, 3);
        } catch (RuntimeException e) {
            // Per-probe isolation: a failed probe must never fail the health endpoint.
            reachable = false;
            message = rootMessage(e);
        }
        return new HealthResponse.DependencyStatus(
                "inference", true, reachable, elapsedMillis(start), message);
    }

    private HealthResponse.DependencyStatus probeDatabase() {
        if (jdbcTemplate.isEmpty()) {
            return new HealthResponse.DependencyStatus(
                    "database", false, false, 0, "Database not configured (scaffold mode)");
        }
        JdbcTemplate jdbc = jdbcTemplate.get();
        long start = System.nanoTime();
        boolean reachable = false;
        String message = null;
        try {
            Integer result = withTimeout(() -> jdbc.queryForObject("SELECT 1 FROM DUAL", Integer.class), 3);
            reachable = result != null;
        } catch (RuntimeException e) {
            // Per-probe isolation: a failed probe must never fail the health endpoint.
            message = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
        }
        return new HealthResponse.DependencyStatus(
                "database", true, reachable, elapsedMillis(start), message);
    }

    private <T> T withTimeout(Supplier<T> supplier, int timeoutSeconds) {
        Future<T> future = probeExecutor.submit(supplier::get);
        try {
            return future.get(timeoutSeconds, TimeUnit.SECONDS);
        } catch (TimeoutException e) {
            future.cancel(true);
            throw new RuntimeException("Health probe timed out after " + timeoutSeconds + "s");
        } catch (ExecutionException e) {
            throw new RuntimeException(e.getCause());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Interrupted");
        }
    }

    private long elapsedMillis(long nanoStart) {
        return (System.nanoTime() - nanoStart) / 1_000_000;
    }

    private String rootMessage(Throwable t) {
        Throwable current = t;
        while (current != null && current.getMessage() == null) {
            current = current.getCause();
        }
        return current != null ? current.getMessage() : t.getClass().getSimpleName();
    }
}
