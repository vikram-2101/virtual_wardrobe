package com.wardrobe.tryon.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TryOnQueueMessage implements Serializable {

    private UUID jobId;

    private UUID userId;

    private UUID outfitId;

    private UUID avatarId;

    private String avatarImageKey;

    private String avatarImageUrl;

    @Builder.Default
    private List<GarmentInfo> garments = new ArrayList<>();

    private Instant createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GarmentInfo implements Serializable {
        private UUID itemId;
        private String category;
        private String subcategory;
        private String imageKey;
        private String imageUrl;
    }
}
