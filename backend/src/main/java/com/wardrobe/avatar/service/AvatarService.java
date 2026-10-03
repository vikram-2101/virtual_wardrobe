package com.wardrobe.avatar.service;

import com.wardrobe.avatar.dto.AvatarResponse;
import com.wardrobe.avatar.entity.Avatar;
import com.wardrobe.avatar.repository.AvatarRepository;
import com.wardrobe.common.exception.BadRequestException;
import com.wardrobe.common.exception.ResourceNotFoundException;
import com.wardrobe.common.storage.StorageService;
import com.wardrobe.user.entity.User;
import com.wardrobe.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AvatarService {

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/webp");
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    private final AvatarRepository avatarRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    @Transactional
    public AvatarResponse uploadAvatar(UUID userId, MultipartFile file) {
        validateImageFile(file);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        UUID avatarId = UUID.randomUUID();
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "avatar.png";
        String extension = getFileExtension(originalFilename);
        String s3Key = String.format("avatars/%s/%s%s", userId, avatarId, extension);

        try {
            storageService.uploadFile(s3Key, file.getInputStream(), file.getSize(), file.getContentType());
        } catch (IOException e) {
            log.error("Failed to upload avatar image to storage: {}", e.getMessage());
            throw new BadRequestException("Failed to upload image: " + e.getMessage());
        }

        String imageUrl = storageService.getObjectUrl(s3Key);

        // If this is the user's first avatar, automatically make it canonical
        boolean isFirstAvatar = avatarRepository.countByUserId(userId) == 0;

        Avatar avatar = Avatar.builder()
                .user(user)
                .imageKey(s3Key)
                .imageUrl(imageUrl)
                .source("UPLOAD")
                .isCanonical(isFirstAvatar)
                .build();
        avatar.setId(avatarId);

        Avatar savedAvatar = avatarRepository.save(avatar);
        log.info("Saved avatar {} for user {} (canonical: {})", savedAvatar.getId(), userId, isFirstAvatar);

        return mapToResponse(savedAvatar);
    }

    @Transactional(readOnly = true)
    public List<AvatarResponse> listUserAvatars(UUID userId) {
        return avatarRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AvatarResponse getCanonicalAvatar(UUID userId) {
        Avatar canonical = avatarRepository.findByUserIdAndIsCanonicalTrue(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No canonical avatar found for user"));
        return mapToResponse(canonical);
    }

    @Transactional
    public AvatarResponse setCanonicalAvatar(UUID userId, UUID avatarId) {
        Avatar targetAvatar = avatarRepository.findByIdAndUserId(avatarId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Avatar", "id", avatarId));

        // Reset existing canonical avatar if any
        avatarRepository.findByUserIdAndIsCanonicalTrue(userId).ifPresent(current -> {
            if (!current.getId().equals(avatarId)) {
                current.setCanonical(false);
                avatarRepository.save(current);
            }
        });

        targetAvatar.setCanonical(true);
        Avatar saved = avatarRepository.save(targetAvatar);
        log.info("Set avatar {} as canonical for user {}", avatarId, userId);

        return mapToResponse(saved);
    }

    @Transactional
    public void deleteAvatar(UUID userId, UUID avatarId) {
        Avatar avatar = avatarRepository.findByIdAndUserId(avatarId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Avatar", "id", avatarId));

        boolean wasCanonical = avatar.isCanonical();
        String imageKey = avatar.getImageKey();

        avatarRepository.delete(avatar);
        storageService.deleteFile(imageKey);
        log.info("Deleted avatar {} for user {}", avatarId, userId);

        // If the deleted avatar was canonical, assign canonical status to the most
        // recent remaining avatar
        if (wasCanonical) {
            List<Avatar> remaining = avatarRepository.findByUserIdOrderByCreatedAtDesc(userId);
            if (!remaining.isEmpty()) {
                Avatar newCanonical = remaining.get(0);
                newCanonical.setCanonical(true);
                avatarRepository.save(newCanonical);
                log.info("Auto-assigned new canonical avatar {} for user {}", newCanonical.getId(), userId);
            }
        }
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Image file cannot be empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("Image file size exceeds maximum limit of 10MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid file format. Allowed formats are: JPG, PNG, WEBP");
        }
    }

    private String getFileExtension(String filename) {
        int lastIndex = filename.lastIndexOf('.');
        return lastIndex > 0 ? filename.substring(lastIndex) : ".png";
    }

    private AvatarResponse mapToResponse(Avatar avatar) {
        return AvatarResponse.builder()
                .id(avatar.getId())
                .userId(avatar.getUser().getId())
                .imageKey(avatar.getImageKey())
                .imageUrl(avatar.getImageUrl())
                .source(avatar.getSource())
                .isCanonical(avatar.isCanonical())
                .createdAt(avatar.getCreatedAt())
                .updatedAt(avatar.getUpdatedAt())
                .build();
    }
}
