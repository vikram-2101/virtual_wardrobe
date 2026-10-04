package com.wardrobe.tryon.dto;

import com.wardrobe.tryon.entity.TryOnJobStatus;
import jakarta.validation.constraints.NotNull;
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
public class TryOnCallbackRequest {

    @NotNull(message = "jobId is required")
    private UUID jobId;

    @NotNull(message = "status is required")
    private TryOnJobStatus status;

    private String resultImageKey;

    private String resultImageUrl;

    private String errorCode;

    private String errorMessage;

    private Instant startedAt;

    private Instant completedAt;
}
