package com.wardrobe.outfit.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOutfitRequest {

    private String name;

    @JsonProperty("isFavorite")
    private Boolean isFavorite;

    private String status; // SAVED, REJECTED, DRAFT, ARCHIVED
}
