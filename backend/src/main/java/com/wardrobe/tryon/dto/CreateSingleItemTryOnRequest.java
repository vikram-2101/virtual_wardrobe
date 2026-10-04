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
public class CreateSingleItemTryOnRequest {

    @NotNull(message = "itemId is required")
    private UUID itemId;

    private UUID avatarId;
}
