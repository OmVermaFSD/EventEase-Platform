package com.eventease.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

/**
 * Redis Configuration for EventEase Backend
 * 
 * Strategy: Cache-Aside Pattern Implementation
 * 
 * Cache-Aside Pattern Flow:
 * 1. Application receives a request for data (e.g., seat availability)
 * 2. First, check Redis cache for the data using a cache key
 * 3. If cache hit (data exists in Redis):
 *    - Return cached data immediately
 *    - Bypass database completely
 *    - Significant performance improvement for read-heavy operations
 * 4. If cache miss (data not in Redis):
 *    - Query the PostgreSQL database for the data
 *    - Return the data to the application
 *    - Asynchronously update Redis cache with the retrieved data
 *    - Set appropriate TTL (Time To Live) for cache expiration
 * 
 * Benefits for EventEase Flash Sale System:
 * - High-frequency seat availability checks served from memory
 * - Reduced database load during peak traffic (flash sales)
 * - Sub-millisecond response times for cached data
 * - Automatic cache refresh prevents stale data
 * - Scalable architecture for handling thousands of concurrent users
 */
@Configuration
@EnableCaching
public class RedisConfig {

    /**
     * Redis Connection Factory
     * Configures connection to Redis server with optimized settings
     */
    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory();
    }

    /**
     * Redis Template Configuration
     * Sets up serialization strategy for Redis operations
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        
        // Use String serializer for keys
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        
        // Use JSON serializer for values
        GenericJackson2JsonRedisSerializer<Object> jsonSerializer = 
            new GenericJackson2JsonRedisSerializer<>(Object.class);
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);
        
        template.afterPropertiesSet();
        return template;
    }

    /**
     * Redis Cache Manager Configuration
     * Configures cache behavior with TTL and serialization
     */
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            // Entry TTL: 5 minutes for seat availability
            .entryTtl(Duration.ofMinutes(5))
            // Serialize cache keys as strings
            .serializeKeysWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new StringRedisSerializer()))
            // Serialize cache values as JSON
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new GenericJackson2JsonRedisSerializer<>(Object.class)))
            // Disable caching null values
            .disableCachingNullValues();

        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(config)
            // Transaction support for data consistency
            .transactionAware()
            .build();
    }

    /**
     * Cache Key Strategy for EventEase
     * 
     * Cache Key Patterns:
     * - "seat:availability:{eventId}" - Available seats count
     * - "seat:status:{seatId}" - Individual seat status
     * - "user:session:{userId}" - User session data
     * - "flashsale:config:{eventId}" - Flash sale configuration
     * - "rate:limit:{userId}:{endpoint}" - API rate limiting
     * 
     * Example Usage:
     * Cache Key: "seat:availability:123"
     * Cache Value: {"available": 45, "total": 100, "lastUpdated": "2024-01-17T10:30:00Z"}
     * TTL: 5 minutes (auto-refresh during active flash sale)
     */
    public static class CacheKeys {
        public static final String SEAT_AVAILABILITY = "seat:availability:%d";
        public static final String SEAT_STATUS = "seat:status:%d";
        public static final String USER_SESSION = "user:session:%s";
        public static final String FLASHSALE_CONFIG = "flashsale:config:%d";
        public static final String RATE_LIMIT = "rate:limit:%s:%s";
        
        public static String seatAvailability(Integer eventId) {
            return String.format(SEAT_AVAILABILITY, eventId);
        }
        
        public static String seatStatus(Integer seatId) {
            return String.format(SEAT_STATUS, seatId);
        }
        
        public static String userSession(String userId) {
            return String.format(USER_SESSION, userId);
        }
        
        public static String flashsaleConfig(Integer eventId) {
            return String.format(FLASHSALE_CONFIG, eventId);
        }
        
        public static String rateLimit(String userId, String endpoint) {
            return String.format(RATE_LIMIT, userId, endpoint);
        }
    }

    /**
     * Cache TTL Configuration
     * Different data types require different cache durations
     */
    public static class CacheTTL {
        // High-frequency data: Short TTL for freshness
        public static final Duration SEAT_AVAILABILITY_TTL = Duration.ofMinutes(5);
        public static final Duration SEAT_STATUS_TTL = Duration.ofMinutes(2);
        
        // Medium-frequency data: Medium TTL
        public static final Duration USER_SESSION_TTL = Duration.ofMinutes(30);
        public static final Duration RATE_LIMIT_TTL = Duration.ofMinutes(1);
        
        // Low-frequency data: Long TTL
        public static final Duration FLASHSALE_CONFIG_TTL = Duration.ofHours(1);
    }
}
