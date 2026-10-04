package com.wardrobe.tryon.entity;

import com.wardrobe.avatar.entity.Avatar;
import com.wardrobe.common.entity.BaseEntity;
import com.wardrobe.outfit.entity.Outfit;
import com.wardrobe.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "try_on_jobs", indexes = {
        @Index(name = "idx_try_on_jobs_user_id", columnList = "user_id"),
        @Index(name = "idx_try_on_jobs_outfit_id", columnList = "outfit_id"),
        @Index(name = "idx_try_on_jobs_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TryOnJob extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "outfit_id", nullable = false)
    private Outfit outfit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "avatar_id")
    private Avatar avatar;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private TryOnJobStatus status = TryOnJobStatus.PENDING;

    @Column(name = "result_image_key", length = 500)
    private String resultImageKey;

    @Column(name = "result_image_url", length = 1000)
    private String resultImageUrl;

    @Column(name = "error_code", length = 100)
    private String errorCode;

    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;
}
