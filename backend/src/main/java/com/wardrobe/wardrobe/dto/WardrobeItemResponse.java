package com.wardrobe.wardrobe.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WardrobeItemResponse {

    private UUID id;
    private UUID userId;
    private String category;
    private String subcategory;
    private String color;
    private String pattern;
    private String fit;
    private String material;
    private String season;
    private String notes;
    private String primaryImageUrl;
    @Builder.Default
    private List<WardrobeImageResponse> images = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;
}
