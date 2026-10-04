package com.wardrobe.tryon.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTryOnJobRequest {

    @NotNull(message = "outfitId is required")
    private UUID outfitId;

    private UUID avatarId;
}
