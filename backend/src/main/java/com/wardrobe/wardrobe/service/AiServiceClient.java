package com.wardrobe.wardrobe.service;

import com.wardrobe.wardrobe.dto.SuggestMetadataResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
public class AiServiceClient {

    private final RestClient restClient;
    private final String aiServiceUrl;

    public AiServiceClient(
            @Value("${ai.service.url:http://localhost:8000}") String aiServiceUrl,
            @Value("${ai.service.timeout-seconds:5}") int timeoutSeconds) {
        this.aiServiceUrl = aiServiceUrl;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(timeoutSeconds * 1000);
        requestFactory.setReadTimeout(timeoutSeconds * 1000);

        this.restClient = RestClient.builder()
                .baseUrl(aiServiceUrl)
                .requestFactory(requestFactory)
                .build();
    }

    public SuggestMetadataResponse extractMetadata(MultipartFile file) {
        try {
            byte[] fileBytes = file.getBytes();
            String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "garment.jpg";

            ByteArrayResource fileResource = new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() {
                    return filename;
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", fileResource);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            log.info("Requesting metadata extraction from AI service at {}/api/ai/metadata/suggest", aiServiceUrl);

            SuggestMetadataResponse response = restClient.post()
                    .uri("/api/ai/metadata/suggest")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(SuggestMetadataResponse.class);

            if (response != null) {
                return response;
            }
        } catch (Exception e) {
            log.warn("AI metadata extraction failed or timed out: {}. Falling back to default metadata template.",
                    e.getMessage());
        }

        return getFallbackMetadata();
    }

    public SuggestMetadataResponse getFallbackMetadata() {
        return SuggestMetadataResponse.builder()
                .category("TOPS")
                .subCategory("clothing-item")
                .color("Unknown")
                .pattern("solid")
                .fit("regular")
                .season("ALL_SEASON")
                .confidence(0.0)
                .detectedTags(Collections.emptyList())
                .isAiGenerated(false)
                .build();
    }
}
