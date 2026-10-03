package com.wardrobe.outfit.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateAutomaticOutfitRequest {

    @NotBlank(message = "Occasion is required (e.g. CASUAL, FORMAL, WORK, PARTY, SUMMER, WINTER, MINIMAL)")
    private String occasion;

    private String season;

    @Builder.Default
    private Boolean includeShoes = false;

    @Builder.Default
    private Boolean includeOuterwear = false;

    private String name;
}
