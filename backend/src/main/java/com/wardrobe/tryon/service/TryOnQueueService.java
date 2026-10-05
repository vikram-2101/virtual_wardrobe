package com.wardrobe.tryon.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wardrobe.tryon.dto.TryOnQueueMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class TryOnQueueService {

    public static final String TRY_ON_QUEUE = "vton:tryon:queue";

    private final ObjectMapper objectMapper;

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    public void enqueueJob(TryOnQueueMessage message) {
        try {
            String jsonPayload = objectMapper.writeValueAsString(message);
            if (redisTemplate != null && redisTemplate.getConnectionFactory() != null) {
                redisTemplate.opsForList().leftPush(TRY_ON_QUEUE, jsonPayload);
                log.info("Enqueued TryOnJob {} to Redis queue '{}'", message.getJobId(), TRY_ON_QUEUE);
            } else {
                log.warn("Redis template or connection factory not available. Job {} logged in memory.",
                        message.getJobId());
            }
        } catch (Exception e) {
            log.error("Failed to enqueue TryOnJob {} to Redis queue: {}", message.getJobId(), e.getMessage(), e);
        }
    }
}
