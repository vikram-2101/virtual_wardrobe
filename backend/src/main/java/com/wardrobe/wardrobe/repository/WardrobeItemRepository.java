package com.wardrobe.wardrobe.repository;

import com.wardrobe.wardrobe.entity.WardrobeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WardrobeItemRepository extends JpaRepository<WardrobeItem, UUID> {
    List<WardrobeItem> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<WardrobeItem> findByUserIdAndCategoryIgnoreCaseOrderByCreatedAtDesc(UUID userId, String category);

    Optional<WardrobeItem> findByIdAndUserId(UUID id, UUID userId);

    long countByUserId(UUID userId);
}
