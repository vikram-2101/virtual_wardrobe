package com.wardrobe.outfit.repository;

import com.wardrobe.outfit.entity.OutfitItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OutfitItemRepository extends JpaRepository<OutfitItem, UUID> {

    List<OutfitItem> findAllByOutfitId(UUID outfitId);

    void deleteAllByOutfitId(UUID outfitId);
}
