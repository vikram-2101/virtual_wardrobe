package com.wardrobe.wardrobe.entity;

import com.wardrobe.common.entity.BaseEntity;
import com.wardrobe.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "wardrobe_items", indexes = {
        @Index(name = "idx_wardrobe_items_user_id", columnList = "user_id"),
        @Index(name = "idx_wardrobe_items_category", columnList = "category")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WardrobeItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "subcategory", length = 50)
    private String subcategory;

    @Column(name = "color", nullable = false, length = 50)
    private String color;

    @Column(name = "pattern", length = 50)
    private String pattern;

    @Column(name = "fit", length = 50)
    private String fit;

    @Column(name = "material", length = 100)
    private String material;

    @Column(name = "season", length = 50)
    private String season;

    @Column(name = "notes", length = 500)
    private String notes;

    @OneToMany(mappedBy = "wardrobeItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<WardrobeImage> images = new ArrayList<>();
}
