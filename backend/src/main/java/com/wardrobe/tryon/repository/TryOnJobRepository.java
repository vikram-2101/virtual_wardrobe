package com.wardrobe.tryon.repository;

import com.wardrobe.tryon.entity.TryOnJob;
import com.wardrobe.tryon.entity.TryOnJobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TryOnJobRepository extends JpaRepository<TryOnJob, UUID> {

    List<TryOnJob> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

    List<TryOnJob> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, TryOnJobStatus status);

    Optional<TryOnJob> findByIdAndUserId(UUID id, UUID userId);

    long countByUserIdAndStatus(UUID userId, TryOnJobStatus status);

    /**
     * Counts try-on jobs for a user created on or after the given timestamp.
     * Used to enforce daily quota limits.
     */
    @Query("SELECT COUNT(j) FROM TryOnJob j WHERE j.user.id = :userId AND j.createdAt >= :since")
    long countByUserIdSince(@Param("userId") UUID userId, @Param("since") Instant since);
}
