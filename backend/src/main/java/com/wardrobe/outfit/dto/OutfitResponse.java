package com.wardrobe.outfit.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wardrobe.wardrobe.dto.WardrobeItemResponse;
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
public class OutfitResponse {

    private UUID id;

    private UUID userId;

    private String name;

    private String source;

    private String status;

    private String occasion;

    @JsonProperty("isFavorite")
    private boolean isFavorite;

    @Builder.Default
    private List<WardrobeItemResponse> items = new ArrayList<>();

    private Instant createdAt;

    private Instant updatedAt;
}
