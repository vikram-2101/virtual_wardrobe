package com.wardrobe.outfit.entity;

import com.wardrobe.common.entity.BaseEntity;
import com.wardrobe.wardrobe.entity.WardrobeItem;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "outfit_items", indexes = {
        @Index(name = "idx_outfit_items_outfit_id", columnList = "outfit_id"),
        @Index(name = "idx_outfit_items_wardrobe_item_id", columnList = "wardrobe_item_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutfitItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "outfit_id", nullable = false)
    private Outfit outfit;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "wardrobe_item_id", nullable = false)
    private WardrobeItem wardrobeItem;
}
