package com.wardrobe.user.profile.dto;

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
public class UserProfileResponse {

    private UUID userId;
    private String email;
    private String name;
    private Double height;
    private Double weight;
    private String gender;
    private String stylePreferences;
    private Instant createdAt;
    private Instant updatedAt;
}
