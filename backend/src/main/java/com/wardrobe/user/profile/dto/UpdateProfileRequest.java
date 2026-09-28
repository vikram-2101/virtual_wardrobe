package com.wardrobe.user.profile.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    private Double height;

    private Double weight;

    @Size(max = 30, message = "Gender must not exceed 30 characters")
    private String gender;

    @Size(max = 500, message = "Style preferences must not exceed 500 characters")
    private String stylePreferences;
}
