package com.wardrobe.tryon.service;

import com.wardrobe.avatar.entity.Avatar;
import com.wardrobe.avatar.repository.AvatarRepository;
import com.wardrobe.common.exception.BadRequestException;
import com.wardrobe.common.exception.ResourceNotFoundException;
import com.wardrobe.common.exception.UnauthorizedException;
import com.wardrobe.common.storage.StorageService;
import com.wardrobe.outfit.entity.Outfit;
import com.wardrobe.outfit.entity.OutfitItem;
import com.wardrobe.outfit.repository.OutfitRepository;
import com.wardrobe.tryon.dto.*;
import com.wardrobe.tryon.entity.TryOnJob;
import com.wardrobe.tryon.entity.TryOnJobStatus;
import com.wardrobe.tryon.repository.TryOnJobRepository;
import com.wardrobe.user.entity.User;
import com.wardrobe.user.repository.UserRepository;
import com.wardrobe.wardrobe.entity.WardrobeImage;
import com.wardrobe.wardrobe.entity.WardrobeItem;
import com.wardrobe.wardrobe.repository.WardrobeItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TryOnService {

    private final TryOnJobRepository tryOnJobRepository;
    private final UserRepository userRepository;
    private final AvatarRepository avatarRepository;
    private final OutfitRepository outfitRepository;
    private final WardrobeItemRepository wardrobeItemRepository;
    private final StorageService storageService;
    private final TryOnQueueService tryOnQueueService;

    @Value("${ai.security.internal-secret:dev_internal_secret_key_12345}")
    private String internalSecret;

    @Value("${app.tryon.daily-limit:5}")
    private int dailyLimit;

    @Transactional
    public TryOnJobResponse createJob(UUID userId, CreateTryOnJobRequest request) {
        // Enforce daily quota
        if (dailyLimit > 0) {
            Instant startOfToday = LocalDate.now(ZoneOffset.UTC)
                    .atStartOfDay()
                    .toInstant(ZoneOffset.UTC);
            long todayCount = tryOnJobRepository.countByUserIdSince(userId, startOfToday);
            if (todayCount >= dailyLimit) {
                throw new BadRequestException(
                        "Daily try-on limit of " + dailyLimit + " reached. Please try again tomorrow.");
            }
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Outfit outfit = outfitRepository.findByIdAndUserId(request.getOutfitId(), userId)
                .orElseThrow(() -> new BadRequestException(
                        "Outfit not found or does not belong to you: " + request.getOutfitId()));

        if (outfit.getItems() == null || outfit.getItems().isEmpty()) {
            throw new BadRequestException("Outfit contains no clothing items to try on.");
        }

        Avatar avatar;
        if (request.getAvatarId() != null) {
            avatar = avatarRepository.findByIdAndUserId(request.getAvatarId(), userId)
                    .orElseThrow(() -> new BadRequestException(
                            "Avatar not found or does not belong to you: " + request.getAvatarId()));
        } else {
            avatar = avatarRepository.findByUserIdAndIsCanonicalTrue(userId)
                    .or(() -> avatarRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().findFirst())
                    .orElseThrow(() -> new BadRequestException(
                            "No avatar found. Please upload an avatar photo before initiating a try-on."));
        }

        TryOnJob job = TryOnJob.builder()
                .user(user)
                .outfit(outfit)
                .avatar(avatar)
                .status(TryOnJobStatus.PENDING)
                .startedAt(Instant.now())
                .build();

        TryOnJob savedJob = tryOnJobRepository.save(job);

        // Build queue payload
        String avatarUrl = avatar.getImageKey() != null
                ? storageService.getObjectUrl(avatar.getImageKey())
                : null;

        List<TryOnQueueMessage.GarmentInfo> garmentInfos = outfit.getItems().stream()
                .map(OutfitItem::getWardrobeItem)
                .map(item -> {
                    String primaryKey = (item.getImages() != null && !item.getImages().isEmpty())
                            ? item.getImages().get(0).getImageKey()
                            : null;
                    String primaryUrl = primaryKey != null ? storageService.getObjectUrl(primaryKey) : null;
                    return TryOnQueueMessage.GarmentInfo.builder()
                            .itemId(item.getId())
                            .category(item.getCategory())
                            .subcategory(item.getSubcategory())
                            .imageKey(primaryKey)
                            .imageUrl(primaryUrl)
                            .build();
                })
                .collect(Collectors.toList());

        TryOnQueueMessage queueMessage = TryOnQueueMessage.builder()
                .jobId(savedJob.getId())
                .userId(userId)
                .outfitId(outfit.getId())
                .avatarId(avatar.getId())
                .avatarImageKey(avatar.getImageKey())
                .avatarImageUrl(avatarUrl)
                .garments(garmentInfos)
                .createdAt(savedJob.getCreatedAt())
                .build();

        tryOnQueueService.enqueueJob(queueMessage);
        log.info("Created TryOnJob {} for user {} (outfit {}, avatar {})", savedJob.getId(), userId, outfit.getId(),
                avatar.getId());

        return mapToResponse(savedJob);
    }

    @Transactional
    public TryOnJobResponse createSingleItemJob(UUID userId, CreateSingleItemTryOnRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        WardrobeItem item = wardrobeItemRepository.findByIdAndUserId(request.getItemId(), userId)
                .orElseThrow(() -> new BadRequestException(
                        "Wardrobe item not found or does not belong to you: " + request.getItemId()));

        // Create a lightweight 1-item outfit for this single garment
        Outfit singleItemOutfit = Outfit.builder()
                .user(user)
                .name("Single Garment: " + item.getCategory() + " (" + (item.getColor() != null ? item.getColor() : "")
                        + ")")
                .source("MANUAL")
                .status("DRAFT")
                .isFavorite(false)
                .items(new ArrayList<>())
                .build();

        OutfitItem outfitItem = OutfitItem.builder()
                .outfit(singleItemOutfit)
                .wardrobeItem(item)
                .build();
        singleItemOutfit.getItems().add(outfitItem);
        Outfit savedOutfit = outfitRepository.save(singleItemOutfit);

        CreateTryOnJobRequest jobRequest = CreateTryOnJobRequest.builder()
                .outfitId(savedOutfit.getId())
                .avatarId(request.getAvatarId())
                .build();

        return createJob(userId, jobRequest);
    }

    @Transactional(readOnly = true)
    public TryOnJobResponse getJob(UUID userId, UUID jobId) {
        TryOnJob job = tryOnJobRepository.findByIdAndUserId(jobId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("TryOnJob", "id", jobId));
        return mapToResponse(job);
    }

    @Transactional(readOnly = true)
    public List<TryOnJobResponse> listJobs(UUID userId, TryOnJobStatus status) {
        List<TryOnJob> jobs;
        if (status != null) {
            jobs = tryOnJobRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status);
        } else {
            jobs = tryOnJobRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
        }

        return jobs.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TryOnJobResponse processCallback(String secretHeader, TryOnCallbackRequest request) {
        if (secretHeader == null || !secretHeader.trim().equals(internalSecret.trim())) {
            throw new UnauthorizedException("Invalid or missing internal secret header");
        }

        TryOnJob job = tryOnJobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("TryOnJob", "id", request.getJobId()));

        job.setStatus(request.getStatus());
        if (request.getResultImageKey() != null) {
            job.setResultImageKey(request.getResultImageKey());
        }
        if (request.getResultImageUrl() != null) {
            job.setResultImageUrl(request.getResultImageUrl());
        } else if (job.getResultImageKey() != null) {
            job.setResultImageUrl(storageService.getObjectUrl(job.getResultImageKey()));
        }

        if (request.getErrorCode() != null) {
            job.setErrorCode(request.getErrorCode());
        }
        if (request.getErrorMessage() != null) {
            job.setErrorMessage(request.getErrorMessage());
        }

        if (request.getStartedAt() != null) {
            job.setStartedAt(request.getStartedAt());
        }
        if (request.getCompletedAt() != null) {
            job.setCompletedAt(request.getCompletedAt());
        } else {
            job.setCompletedAt(Instant.now());
        }

        TryOnJob saved = tryOnJobRepository.save(job);
        log.info("Processed callback for TryOnJob {}: status={}", saved.getId(), saved.getStatus());
        return mapToResponse(saved);
    }

    public TryOnJobResponse mapToResponse(TryOnJob job) {
        String resultUrl = job.getResultImageUrl();
        if (resultUrl == null && job.getResultImageKey() != null) {
            resultUrl = storageService.getObjectUrl(job.getResultImageKey());
        }

        return TryOnJobResponse.builder()
                .id(job.getId())
                .userId(job.getUser().getId())
                .outfitId(job.getOutfit().getId())
                .avatarId(job.getAvatar() != null ? job.getAvatar().getId() : null)
                .status(job.getStatus())
                .resultImageKey(job.getResultImageKey())
                .resultImageUrl(resultUrl)
                .errorCode(job.getErrorCode())
                .errorMessage(job.getErrorMessage())
                .startedAt(job.getStartedAt())
                .completedAt(job.getCompletedAt())
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }
}
