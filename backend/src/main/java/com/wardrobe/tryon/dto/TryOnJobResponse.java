package com.wardrobe.tryon.dto;

import com.wardrobe.tryon.entity.TryOnJobStatus;
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
public class TryOnJobResponse {

    private UUID id;

    private UUID userId;

    private UUID outfitId;

    private UUID avatarId;

    private TryOnJobStatus status;

    private String resultImageKey;

    private String resultImageUrl;

    private String errorCode;

    private String errorMessage;

    private Instant startedAt;

    private Instant completedAt;

    private Instant createdAt;

    private Instant updatedAt;
}
