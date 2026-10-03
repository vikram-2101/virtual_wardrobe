package com.wardrobe.outfit.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOutfitRequest {

    private String name;

    @NotEmpty(message = "Item IDs list must contain at least one wardrobe item")
    private List<UUID> itemIds;
}
