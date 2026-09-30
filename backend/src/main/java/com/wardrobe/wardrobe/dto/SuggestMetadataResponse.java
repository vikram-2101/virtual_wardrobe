package com.wardrobe.wardrobe.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuggestMetadataResponse {

    private String category;

    private String subCategory;

    private String color;

    private String pattern;

    private String fit;

    private String season;

    private Double confidence;

    private List<String> detectedTags;

    @JsonProperty("isAiGenerated")
    private Boolean isAiGenerated;
}
