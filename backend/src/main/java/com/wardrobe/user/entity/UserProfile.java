package com.wardrobe.user.entity;

import com.wardrobe.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "height")
    private Double height; // In centimeters (cm)

    @Column(name = "weight")
    private Double weight; // In kilograms (kg)

    @Column(name = "gender", length = 30)
    private String gender;

    @Column(name = "style_preferences", length = 500)
    private String stylePreferences;
}
