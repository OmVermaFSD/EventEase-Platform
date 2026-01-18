package com.eventease;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.Refill;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;
import java.util.function.Supplier;

@Component
@Slf4j
public class RateLimitInterceptor implements HandlerInterceptor {

    private final ProxyManager<String> buckets;

    @Autowired
    public RateLimitInterceptor(ProxyManager<String> buckets) {
        this.buckets = buckets;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String clientIP = getClientIP(request);
        
        Supplier<BucketConfiguration> configSupplier = getConfigSupplier();
        Bucket bucket = buckets.builder().build(clientIP, configSupplier);
        
        if (bucket.tryConsume(1)) {
            return true;
        } else {
            log.warn("Rate limit exceeded for IP: {}", clientIP);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());  // HTTP 429
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"error\":\"TOO_MANY_REQUESTS\",\"message\":\"Rate limit exceeded: 10 requests per minute\",\"code\":\"429\"}"
            );
            return false;
        }
    }

    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private Supplier<BucketConfiguration> getConfigSupplier() {
        // 10 requests per minute
        Refill refill = Refill.intervally(10, Duration.ofMinutes(1));
        Bandwidth limit = Bandwidth.classic(10, refill);
        return () -> BucketConfiguration.builder()
                .addLimit(limit)
                .build();
    }
}
