package com.G9_LATAM_TEAM_58.techapi.common.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected boolean shouldNotFilterAsyncDispatch() {
        return true;
    }

    @Override
    protected boolean shouldNotFilterErrorDispatch() {
        // Error dispatch re-enters this filter and would emit a second log pair for
        // the same request; the GlobalExceptionHandler is the single owner of error
        // logging, so one log pair per request is enough.
        return true;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        long start = System.currentTimeMillis();
        String method = request.getMethod();
        String queryString = request.getQueryString();
        String target = request.getRequestURI() + (queryString != null ? "?" + queryString : "");
        String remoteAddr = request.getRemoteAddr();

        log.info("→ {} {} from {}", method, target, remoteAddr);
        try {
            filterChain.doFilter(request, response);
        } finally {
            long elapsed = System.currentTimeMillis() - start;
            // getStatus() may be stale in some error paths — acceptable trade-off
            log.info("← {} {} -> {} ({} ms) from {}", method, target, response.getStatus(), elapsed, remoteAddr);
        }
    }
}
