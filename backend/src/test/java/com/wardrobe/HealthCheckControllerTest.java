package com.wardrobe;

import com.wardrobe.common.storage.StorageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import software.amazon.awssdk.services.s3.S3Client;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class HealthCheckControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RedisTemplate<String, Object> redisTemplate;

    @MockBean
    private StorageService storageService;

    @MockBean
    private RedisConnectionFactory redisConnectionFactory;

    @MockBean
    private S3Client s3Client;

    @Test
    void testPingEndpoint() throws Exception {
        mockMvc.perform(get("/api/health/ping"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ping").value("pong"))
                .andExpect(jsonPath("$.service").value("backend-spring-boot"));
    }

    @Test
    void testHealthEndpointWhenAllHealthy() throws Exception {
        RedisConnectionFactory mockFactory = mock(RedisConnectionFactory.class);
        RedisConnection mockRedisConn = mock(RedisConnection.class);
        when(mockRedisConn.ping()).thenReturn("PONG");
        when(mockFactory.getConnection()).thenReturn(mockRedisConn);
        when(redisTemplate.getConnectionFactory()).thenReturn(mockFactory);

        when(storageService.checkHealth()).thenReturn(true);

        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("backend-spring-boot"))
                .andExpect(jsonPath("$.dependencies.database").value("UP (PostgreSQL)"))
                .andExpect(jsonPath("$.dependencies.redis").value("UP"))
                .andExpect(jsonPath("$.dependencies.storage").value("UP (MinIO / S3)"));
    }
}
