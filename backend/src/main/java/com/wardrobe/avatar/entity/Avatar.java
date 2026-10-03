package com.wardrobe.avatar.entity;

import com.wardrobe.common.entity.BaseEntity;
import com.wardrobe.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "avatars", indexes = {
        @Index(name = "idx_avatars_user_id", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Avatar extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "image_key", nullable = false, length = 500)
    private String imageKey;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(name = "source", length = 50)
    @Builder.Default
    private String source = "UPLOAD";

    @Column(name = "is_canonical", nullable = false)
    @Builder.Default
    private boolean isCanonical = false;
}
