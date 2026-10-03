package com.wardrobe.outfit.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateControlledOutfitRequest {

    private String name;

    @NotEmpty(message = "Categories list must contain at least one category")
    private List<String> categories;
}
