package com.wardrobe.avatar.repository;

import com.wardrobe.avatar.entity.Avatar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AvatarRepository extends JpaRepository<Avatar, UUID> {
    List<Avatar> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Avatar> findByUserIdAndIsCanonicalTrue(UUID userId);

    Optional<Avatar> findByIdAndUserId(UUID id, UUID userId);

    long countByUserId(UUID userId);
}
