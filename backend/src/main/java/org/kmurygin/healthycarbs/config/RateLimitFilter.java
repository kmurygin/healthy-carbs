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
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Profile("!test")
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_AUTH_REQUESTS_PER_WINDOW = 10;
    private static final long RATE_LIMIT_WINDOW_MILLIS = 60_000;
    private static final long EVICTION_INTERVAL_MILLIS = 60_000;
    private static final String RATE_LIMITED_PATH_PREFIX = "/api/v1/auth/";
    private static final String FORWARDED_FOR_HEADER = "X-Forwarded-For";

    private final Map<String, ClientRequestWindow> requestCountByIp = new ConcurrentHashMap<>();

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

        boolean isWithinLimit = requestCountByIp.compute(clientIp, (ip, existingWindow) -> {
            if (existingWindow == null || currentTimeMillis - existingWindow.windowStartMillis() > RATE_LIMIT_WINDOW_MILLIS) {
                return new ClientRequestWindow(currentTimeMillis, new AtomicInteger(1));
            }
            existingWindow.requestCount().incrementAndGet();
            return existingWindow;
        }).requestCount().get() <= MAX_AUTH_REQUESTS_PER_WINDOW;

        if (!isWithinLimit) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("Too many requests. Please try again later.");
            return;
        }

        filterChain.doFilter(request, response);
    }

    @Scheduled(fixedRate = EVICTION_INTERVAL_MILLIS)
    void evictExpiredWindows() {
        long currentTimeMillis = System.currentTimeMillis();
        requestCountByIp.entrySet().removeIf(entry ->
                currentTimeMillis - entry.getValue().windowStartMillis() > RATE_LIMIT_WINDOW_MILLIS
        );
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader(FORWARDED_FOR_HEADER);
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private record ClientRequestWindow(long windowStartMillis, AtomicInteger requestCount) {
    }
}
