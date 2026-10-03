package com.wardrobe.outfit.entity;

import com.wardrobe.common.entity.BaseEntity;
import com.wardrobe.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "outfits", indexes = {
        @Index(name = "idx_outfits_user_id", columnList = "user_id"),
        @Index(name = "idx_outfits_user_status", columnList = "user_id, status"),
        @Index(name = "idx_outfits_user_fav", columnList = "user_id, is_favorite")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Outfit extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "source", nullable = false, length = 50)
    @Builder.Default
    private String source = "MANUAL"; // MANUAL, CONTROLLED_GENERATION, AUTOMATIC_RULE_ENGINE, SINGLE_ITEM_TRYON

    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private String status = "SAVED"; // SAVED, REJECTED, DRAFT, ARCHIVED

    @Column(name = "occasion", length = 50)
    private String occasion; // CASUAL, FORMAL, WORK, PARTY, SUMMER, WINTER, etc.

    @Column(name = "is_favorite", nullable = false)
    @Builder.Default
    private boolean isFavorite = false;

    @OneToMany(mappedBy = "outfit", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OutfitItem> items = new ArrayList<>();
}
