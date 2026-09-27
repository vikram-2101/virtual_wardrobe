package com.wardrobe.common.health;

import com.wardrobe.common.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthCheckController {

    private final DataSource dataSource;
    private final RedisTemplate<String, Object> redisTemplate;
    private final StorageService storageService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getHealthStatus() {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> dependencies = new HashMap<>();
        boolean isAllHealthy = true;

        // Check PostgreSQL
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(2)) {
                dependencies.put("database", "UP (PostgreSQL)");
            } else {
                dependencies.put("database", "DOWN");
                isAllHealthy = false;
            }
        } catch (Exception e) {
            dependencies.put("database", "DOWN: " + e.getMessage());
            isAllHealthy = false;
        }

        // Check Redis
        try {
            RedisConnection redisConn = redisTemplate.getConnectionFactory() != null
                    ? redisTemplate.getConnectionFactory().getConnection()
                    : null;
            if (redisConn != null && "PONG".equalsIgnoreCase(redisConn.ping())) {
                dependencies.put("redis", "UP");
                redisConn.close();
            } else {
                dependencies.put("redis", "DOWN");
                isAllHealthy = false;
            }
        } catch (Exception e) {
            dependencies.put("redis", "DOWN: " + e.getMessage());
            isAllHealthy = false;
        }

        // Check Storage (MinIO)
        if (storageService.checkHealth()) {
            dependencies.put("storage", "UP (MinIO / S3)");
        } else {
            dependencies.put("storage", "DOWN");
            isAllHealthy = false;
        }

        response.put("status", isAllHealthy ? "UP" : "DEGRADED");
        response.put("service", "backend-spring-boot");
        response.put("dependencies", dependencies);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        Map<String, String> response = new HashMap<>();
        response.put("ping", "pong");
        response.put("service", "backend-spring-boot");
        return ResponseEntity.ok(response);
    }
}
