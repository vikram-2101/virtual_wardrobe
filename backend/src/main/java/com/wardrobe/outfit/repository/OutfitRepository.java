package com.wardrobe.outfit.repository;

import com.wardrobe.outfit.entity.Outfit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OutfitRepository extends JpaRepository<Outfit, UUID> {

    List<Outfit> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

    List<Outfit> findAllByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, String status);

    List<Outfit> findAllByUserIdAndIsFavoriteOrderByCreatedAtDesc(UUID userId, boolean isFavorite);

    List<Outfit> findAllByUserIdAndStatusAndIsFavoriteOrderByCreatedAtDesc(UUID userId, String status,
            boolean isFavorite);

    List<Outfit> findAllByUserIdAndSourceOrderByCreatedAtDesc(UUID userId, String source);

    Optional<Outfit> findByIdAndUserId(UUID id, UUID userId);
}
