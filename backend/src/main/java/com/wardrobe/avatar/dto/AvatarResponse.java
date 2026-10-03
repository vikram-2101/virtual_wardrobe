package com.wardrobe.avatar.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvatarResponse {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("userId")
    private UUID userId;

    @JsonProperty("imageKey")
    private String imageKey;

    @JsonProperty("imageUrl")
    private String imageUrl;

    @JsonProperty("source")
    private String source;

    @JsonProperty("isCanonical")
    private boolean isCanonical;

    @JsonProperty("createdAt")
    private Instant createdAt;

    @JsonProperty("updatedAt")
    private Instant updatedAt;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getImageKey() {
        return imageKey;
    }

    public void setImageKey(String imageKey) {
        this.imageKey = imageKey;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    @JsonProperty("isCanonical")
    public boolean isCanonical() {
        return isCanonical;
    }

    @JsonProperty("isCanonical")
    public void setCanonical(boolean canonical) {
        this.isCanonical = canonical;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
