package com.wardrobe.wardrobe.service;

import com.wardrobe.common.exception.BadRequestException;
import com.wardrobe.common.exception.ResourceNotFoundException;
import com.wardrobe.common.storage.StorageService;
import com.wardrobe.user.entity.User;
import com.wardrobe.user.repository.UserRepository;
import com.wardrobe.wardrobe.dto.CreateWardrobeItemRequest;
import com.wardrobe.wardrobe.dto.UpdateWardrobeItemRequest;
import com.wardrobe.wardrobe.dto.WardrobeImageResponse;
import com.wardrobe.wardrobe.dto.WardrobeItemResponse;
import com.wardrobe.wardrobe.entity.WardrobeImage;
import com.wardrobe.wardrobe.entity.WardrobeItem;
import com.wardrobe.wardrobe.repository.WardrobeItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WardrobeService {

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/webp");
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    private final WardrobeItemRepository wardrobeRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    @Transactional
    public WardrobeItemResponse createItem(
            UUID userId,
            CreateWardrobeItemRequest request,
            MultipartFile frontImage,
            MultipartFile backImage) {
        validateImageFile(frontImage, "Front image");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        UUID itemId = UUID.randomUUID();

        WardrobeItem item = WardrobeItem.builder()
                .user(user)
                .category(request.getCategory().trim().toUpperCase())
                .subcategory(request.getSubcategory())
                .color(request.getColor().trim())
                .pattern(request.getPattern())
                .fit(request.getFit())
                .material(request.getMaterial())
                .season(request.getSeason())
                .notes(request.getNotes())
                .images(new ArrayList<>())
                .build();
        item.setId(itemId);

        // Upload front image
        WardrobeImage frontImg = saveAndUploadImage(userId, itemId, item, frontImage, "FRONT");
        item.getImages().add(frontImg);

        // Upload back image if provided
        if (backImage != null && !backImage.isEmpty()) {
            validateImageFile(backImage, "Back image");
            WardrobeImage backImg = saveAndUploadImage(userId, itemId, item, backImage, "BACK");
            item.getImages().add(backImg);
        }

        WardrobeItem savedItem = wardrobeRepository.save(item);
        log.info("Created wardrobe item {} for user {}", savedItem.getId(), userId);

        return mapToResponse(savedItem);
    }

    @Transactional(readOnly = true)
    public List<WardrobeItemResponse> listItems(UUID userId, String category) {
        List<WardrobeItem> items;
        if (category != null && !category.trim().isEmpty()) {
            items = wardrobeRepository.findByUserIdAndCategoryIgnoreCaseOrderByCreatedAtDesc(userId, category.trim());
        } else {
            items = wardrobeRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }

        return items.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WardrobeItemResponse getItem(UUID userId, UUID itemId) {
        WardrobeItem item = wardrobeRepository.findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("WardrobeItem", "id", itemId));
        return mapToResponse(item);
    }

    @Transactional
    public WardrobeItemResponse updateItem(
            UUID userId,
            UUID itemId,
            UpdateWardrobeItemRequest request,
            MultipartFile frontImage,
            MultipartFile backImage) {
        WardrobeItem item = wardrobeRepository.findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("WardrobeItem", "id", itemId));

        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            item.setCategory(request.getCategory().trim().toUpperCase());
        }
        if (request.getSubcategory() != null) {
            item.setSubcategory(request.getSubcategory());
        }
        if (request.getColor() != null && !request.getColor().isBlank()) {
            item.setColor(request.getColor().trim());
        }
        if (request.getPattern() != null) {
            item.setPattern(request.getPattern());
        }
        if (request.getFit() != null) {
            item.setFit(request.getFit());
        }
        if (request.getMaterial() != null) {
            item.setMaterial(request.getMaterial());
        }
        if (request.getSeason() != null) {
            item.setSeason(request.getSeason());
        }
        if (request.getNotes() != null) {
            item.setNotes(request.getNotes());
        }

        // Replace front image if provided
        if (frontImage != null && !frontImage.isEmpty()) {
            validateImageFile(frontImage, "Front image");
            item.getImages().removeIf(img -> "FRONT".equalsIgnoreCase(img.getImageType()));
            WardrobeImage newFront = saveAndUploadImage(userId, itemId, item, frontImage, "FRONT");
            item.getImages().add(newFront);
        }

        // Replace back image if provided
        if (backImage != null && !backImage.isEmpty()) {
            validateImageFile(backImage, "Back image");
            item.getImages().removeIf(img -> "BACK".equalsIgnoreCase(img.getImageType()));
            WardrobeImage newBack = saveAndUploadImage(userId, itemId, item, backImage, "BACK");
            item.getImages().add(newBack);
        }

        WardrobeItem saved = wardrobeRepository.save(item);
        log.info("Updated wardrobe item {} for user {}", itemId, userId);

        return mapToResponse(saved);
    }

    @Transactional
    public void deleteItem(UUID userId, UUID itemId) {
        WardrobeItem item = wardrobeRepository.findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("WardrobeItem", "id", itemId));

        // Delete S3 images
        for (WardrobeImage image : item.getImages()) {
            storageService.deleteFile(image.getImageKey());
        }

        wardrobeRepository.delete(item);
        log.info("Deleted wardrobe item {} and associated S3 images for user {}", itemId, userId);
    }

    private WardrobeImage saveAndUploadImage(
            UUID userId,
            UUID itemId,
            WardrobeItem item,
            MultipartFile file,
            String imageType) {
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.png";
        String ext = getFileExtension(originalFilename);
        String s3Key = String.format("wardrobe/%s/%s/%s_%s%s", userId, itemId, imageType.toLowerCase(),
                UUID.randomUUID(), ext);

        try {
            storageService.uploadFile(s3Key, file.getInputStream(), file.getSize(), file.getContentType());
        } catch (IOException e) {
            log.error("Failed to upload wardrobe image to S3: {}", e.getMessage());
            throw new BadRequestException("Failed to upload " + imageType + " image: " + e.getMessage());
        }

        String imageUrl = storageService.getObjectUrl(s3Key);

        return WardrobeImage.builder()
                .wardrobeItem(item)
                .imageKey(s3Key)
                .imageUrl(imageUrl)
                .imageType(imageType)
                .build();
    }

    private void validateImageFile(MultipartFile file, String fieldName) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException(fieldName + " cannot be empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException(fieldName + " size exceeds maximum limit of 10MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException(fieldName + " has invalid format. Allowed formats are: JPG, PNG, WEBP");
        }
    }

    private String getFileExtension(String filename) {
        int lastIndex = filename.lastIndexOf('.');
        return lastIndex > 0 ? filename.substring(lastIndex) : ".png";
    }

    public WardrobeItemResponse mapToResponse(WardrobeItem item) {
        List<WardrobeImageResponse> imageResponses = item.getImages() != null ? item.getImages().stream()
                .map(img -> WardrobeImageResponse.builder()
                        .id(img.getId())
                        .imageKey(img.getImageKey())
                        .imageUrl(img.getImageUrl())
                        .imageType(img.getImageType())
                        .createdAt(img.getCreatedAt())
                        .build())
                .collect(Collectors.toList()) : new ArrayList<>();

        String primaryUrl = imageResponses.stream()
                .filter(img -> "FRONT".equalsIgnoreCase(img.getImageType()))
                .map(WardrobeImageResponse::getImageUrl)
                .findFirst()
                .orElse(imageResponses.isEmpty() ? null : imageResponses.get(0).getImageUrl());

        return WardrobeItemResponse.builder()
                .id(item.getId())
                .userId(item.getUser().getId())
                .category(item.getCategory())
                .subcategory(item.getSubcategory())
                .color(item.getColor())
                .pattern(item.getPattern())
                .fit(item.getFit())
                .material(item.getMaterial())
                .season(item.getSeason())
                .notes(item.getNotes())
                .primaryImageUrl(primaryUrl)
                .images(imageResponses)
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
