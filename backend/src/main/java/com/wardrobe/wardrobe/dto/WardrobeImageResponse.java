package com.wardrobe.wardrobe.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WardrobeImageResponse {

    private UUID id;
    private String imageKey;
    private String imageUrl;
    private String imageType;
    private Instant createdAt;
}
