package org.kmurygin.healthycarbs.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Profile("!test")
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_AUTH_REQUESTS_PER_WINDOW = 10;
    private static final int MAX_SENSITIVE_REQUESTS_PER_WINDOW = 5;
    private static final long RATE_LIMIT_WINDOW_MILLIS = 60_000;
    private static final long EVICTION_INTERVAL_MILLIS = 60_000;
    private static final String RATE_LIMITED_PATH_PREFIX = "/api/v1/auth/";
    private static final String FORWARDED_FOR_HEADER = "X-Forwarded-For";

    private static final Set<String> SENSITIVE_PATHS = Set.of(
            "/api/v1/auth/verify-otp",
            "/api/v1/auth/forgot-password",
            "/api/v1/auth/reset-password"
    );

    private final Map<String, ClientRequestWindow> requestCountByIp = new ConcurrentHashMap<>();
    private final Map<String, ClientRequestWindow> sensitiveRequestCountByIp = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        if (!request.getRequestURI().startsWith(RATE_LIMITED_PATH_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = resolveClientIp(request);
        long currentTimeMillis = System.currentTimeMillis();

        boolean isWithinLimit = checkLimit(
                requestCountByIp, clientIp, currentTimeMillis, MAX_AUTH_REQUESTS_PER_WINDOW
        );

        if (isWithinLimit && SENSITIVE_PATHS.contains(request.getRequestURI())) {
            isWithinLimit = checkLimit(
                    sensitiveRequestCountByIp, clientIp, currentTimeMillis, MAX_SENSITIVE_REQUESTS_PER_WINDOW
            );
        }

        if (!isWithinLimit) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("Too many requests. Please try again later.");
            return;
        }

        filterChain.doFilter(request, response);
    }

    @Scheduled(fixedRate = EVICTION_INTERVAL_MILLIS)
    void evictExpiredWindows() {
        long now = System.currentTimeMillis();
        requestCountByIp.entrySet().removeIf(
                entry -> isExpiredOrAbsent(entry.getValue(), now)
        );
        sensitiveRequestCountByIp.entrySet().removeIf(
                entry -> isExpiredOrAbsent(entry.getValue(), now)
        );
    }

    private boolean checkLimit(
            Map<String, ClientRequestWindow> windowMap,
            String clientIp,
            long currentTimeMillis,
            int maxRequests
    ) {
        ClientRequestWindow window = windowMap.compute(clientIp, (ip, existing) ->
                isExpiredOrAbsent(existing, currentTimeMillis)
                        ? new ClientRequestWindow(currentTimeMillis, new AtomicInteger(1))
                        : existing.incrementAndGet()
        );
        return window.requestCount().get() <= maxRequests;
    }

    private boolean isExpiredOrAbsent(ClientRequestWindow window, long currentTimeMillis) {
        return window == null || currentTimeMillis - window.windowStartMillis() > RATE_LIMIT_WINDOW_MILLIS;
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader(FORWARDED_FOR_HEADER);
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private record ClientRequestWindow(long windowStartMillis, AtomicInteger requestCount) {
        ClientRequestWindow incrementAndGet() {
            requestCount.incrementAndGet();
            return this;
        }
    }
}
