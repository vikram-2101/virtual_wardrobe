package com.wardrobe.wardrobe.entity;

import com.wardrobe.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "wardrobe_images", indexes = {
        @Index(name = "idx_wardrobe_images_item_id", columnList = "wardrobe_item_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WardrobeImage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "wardrobe_item_id", nullable = false)
    private WardrobeItem wardrobeItem;

    @Column(name = "image_key", nullable = false, length = 500)
    private String imageKey;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(name = "image_type", nullable = false, length = 30)
    @Builder.Default
    private String imageType = "FRONT"; // FRONT, BACK, PROCESSED, SEGMENTED
}
