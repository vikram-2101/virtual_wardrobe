package com.wardrobe.wardrobe.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateWardrobeItemRequest {

    @Size(max = 50, message = "Category must not exceed 50 characters")
    private String category;

    @Size(max = 50, message = "Subcategory must not exceed 50 characters")
    private String subcategory;

    @Size(max = 50, message = "Color must not exceed 50 characters")
    private String color;

    @Size(max = 50, message = "Pattern must not exceed 50 characters")
    private String pattern;

    @Size(max = 50, message = "Fit must not exceed 50 characters")
    private String fit;

    @Size(max = 100, message = "Material must not exceed 100 characters")
    private String material;

    @Size(max = 50, message = "Season must not exceed 50 characters")
    private String season;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
}
