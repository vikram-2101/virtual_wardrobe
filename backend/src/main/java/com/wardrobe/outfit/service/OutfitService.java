package com.wardrobe.outfit.service;

import com.wardrobe.common.exception.BadRequestException;
import com.wardrobe.common.exception.ResourceNotFoundException;
import com.wardrobe.outfit.dto.*;
import com.wardrobe.outfit.entity.Outfit;
import com.wardrobe.outfit.entity.OutfitItem;
import com.wardrobe.outfit.repository.OutfitRepository;
import com.wardrobe.user.entity.User;
import com.wardrobe.user.repository.UserRepository;
import com.wardrobe.wardrobe.dto.WardrobeItemResponse;
import com.wardrobe.wardrobe.entity.WardrobeItem;
import com.wardrobe.wardrobe.repository.WardrobeItemRepository;
import com.wardrobe.wardrobe.service.WardrobeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OutfitService {

        private final OutfitRepository outfitRepository;
        private final UserRepository userRepository;
        private final WardrobeItemRepository wardrobeRepository;
        private final WardrobeService wardrobeService;
        private final AutomaticOutfitRuleEngine automaticOutfitRuleEngine;

        private static final List<String> VALID_STATUSES = Arrays.asList("SAVED", "REJECTED", "DRAFT", "ARCHIVED");

        // -------------------------------------------------------------------------
        // Automatic outfit generation (rule engine)
        // -------------------------------------------------------------------------

        @Transactional
        public OutfitResponse generateAutomaticOutfit(UUID userId, GenerateAutomaticOutfitRequest request) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

                List<WardrobeItem> allItems = wardrobeRepository.findByUserIdOrderByCreatedAtDesc(userId);
                List<WardrobeItem> selectedItems = automaticOutfitRuleEngine.generateOutfit(allItems, request);

                String occasionStr = request.getOccasion().trim();
                String formattedOccasion = occasionStr.substring(0, 1).toUpperCase()
                                + occasionStr.substring(1).toLowerCase();
                String outfitName = (request.getName() != null && !request.getName().isBlank())
                                ? request.getName().trim()
                                : formattedOccasion + " Outfit";

                Outfit outfit = Outfit.builder()
                                .user(user)
                                .name(outfitName)
                                .source("AUTOMATIC_RULE_ENGINE")
                                .status("SAVED")
                                .occasion(occasionStr.toUpperCase())
                                .isFavorite(false)
                                .items(new ArrayList<>())
                                .build();

                for (WardrobeItem item : selectedItems) {
                        OutfitItem outfitItem = OutfitItem.builder()
                                        .outfit(outfit)
                                        .wardrobeItem(item)
                                        .build();
                        outfit.getItems().add(outfitItem);
                }

                Outfit savedOutfit = outfitRepository.save(outfit);
                log.info("Generated automatic outfit {} for occasion {} with {} items for user {}",
                                savedOutfit.getId(), request.getOccasion(), selectedItems.size(), userId);
                return mapToResponse(savedOutfit);
        }

        // -------------------------------------------------------------------------
        // Controlled outfit generation (user-specified categories)
        // -------------------------------------------------------------------------

        @Transactional
        public OutfitResponse generateControlledOutfit(UUID userId, GenerateControlledOutfitRequest request) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

                if (request.getCategories() == null || request.getCategories().isEmpty()) {
                        throw new BadRequestException(
                                        "At least one category is required for controlled outfit generation");
                }

                List<String> normalizedCategories = request.getCategories().stream()
                                .filter(c -> c != null && !c.isBlank())
                                .map(c -> c.trim().toUpperCase())
                                .distinct()
                                .collect(Collectors.toList());

                if (normalizedCategories.isEmpty()) {
                        throw new BadRequestException(
                                        "At least one valid category is required for controlled outfit generation");
                }

                List<WardrobeItem> selectedItems = new ArrayList<>();
                for (String category : normalizedCategories) {
                        List<WardrobeItem> availableItems = wardrobeRepository
                                        .findByUserIdAndCategoryIgnoreCaseOrderByCreatedAtDesc(userId, category);
                        if (availableItems.isEmpty()) {
                                throw new BadRequestException(
                                                "No wardrobe items found for category '" + category
                                                                + "'. Please add an item in this category first.");
                        }
                        int randomIndex = ThreadLocalRandom.current().nextInt(availableItems.size());
                        selectedItems.add(availableItems.get(randomIndex));
                }

                String outfitName = (request.getName() != null && !request.getName().isBlank())
                                ? request.getName().trim()
                                : "Outfit with " + String.join(", ", normalizedCategories);

                Outfit outfit = Outfit.builder()
                                .user(user)
                                .name(outfitName)
                                .source("CONTROLLED_GENERATION")
                                .status("SAVED")
                                .isFavorite(false)
                                .items(new ArrayList<>())
                                .build();

                for (WardrobeItem item : selectedItems) {
                        OutfitItem outfitItem = OutfitItem.builder()
                                        .outfit(outfit)
                                        .wardrobeItem(item)
                                        .build();
                        outfit.getItems().add(outfitItem);
                }

                Outfit savedOutfit = outfitRepository.save(outfit);
                log.info("Generated controlled outfit {} with {} items for user {}", savedOutfit.getId(),
                                selectedItems.size(), userId);
                return mapToResponse(savedOutfit);
        }

        // -------------------------------------------------------------------------
        // Manual outfit creation
        // -------------------------------------------------------------------------

        @Transactional
        public OutfitResponse createManualOutfit(UUID userId, CreateOutfitRequest request) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

                if (request.getItemIds() == null || request.getItemIds().isEmpty()) {
                        throw new BadRequestException("Item IDs list must contain at least one wardrobe item");
                }

                List<UUID> distinctItemIds = request.getItemIds().stream()
                                .filter(id -> id != null)
                                .distinct()
                                .collect(Collectors.toList());

                List<WardrobeItem> items = new ArrayList<>();
                for (UUID itemId : distinctItemIds) {
                        WardrobeItem item = wardrobeRepository.findByIdAndUserId(itemId, userId)
                                        .orElseThrow(() -> new BadRequestException(
                                                        "Wardrobe item not found or does not belong to you: "
                                                                        + itemId));
                        items.add(item);
                }

                String outfitName = (request.getName() != null && !request.getName().isBlank())
                                ? request.getName().trim()
                                : "Custom Outfit";

                Outfit outfit = Outfit.builder()
                                .user(user)
                                .name(outfitName)
                                .source("MANUAL")
                                .status("SAVED")
                                .isFavorite(false)
                                .items(new ArrayList<>())
                                .build();

                for (WardrobeItem item : items) {
                        OutfitItem outfitItem = OutfitItem.builder()
                                        .outfit(outfit)
                                        .wardrobeItem(item)
                                        .build();
                        outfit.getItems().add(outfitItem);
                }

                Outfit savedOutfit = outfitRepository.save(outfit);
                log.info("Created manual outfit {} with {} items for user {}", savedOutfit.getId(), items.size(),
                                userId);
                return mapToResponse(savedOutfit);
        }

        // -------------------------------------------------------------------------
        // Outfit interaction (favorite, status, regenerate, update, delete, list, get)
        // -------------------------------------------------------------------------

        @Transactional
        public OutfitResponse toggleFavorite(UUID userId, UUID outfitId, Boolean isFavorite) {
                Outfit outfit = outfitRepository.findByIdAndUserId(outfitId, userId)
                                .orElseThrow(() -> new ResourceNotFoundException("Outfit", "id", outfitId));

                if (isFavorite != null) {
                        outfit.setFavorite(isFavorite);
                } else {
                        outfit.setFavorite(!outfit.isFavorite());
                }

                Outfit saved = outfitRepository.save(outfit);
                log.info("Updated favorite status to {} for outfit {} (user {})", saved.isFavorite(), outfitId, userId);
                return mapToResponse(saved);
        }

        @Transactional
        public OutfitResponse updateStatus(UUID userId, UUID outfitId, String status) {
                Outfit outfit = outfitRepository.findByIdAndUserId(outfitId, userId)
                                .orElseThrow(() -> new ResourceNotFoundException("Outfit", "id", outfitId));

                String normalizedStatus = status.trim().toUpperCase();
                if (!VALID_STATUSES.contains(normalizedStatus)) {
                        throw new BadRequestException(
                                        "Invalid outfit status: " + status + ". Allowed statuses: " + VALID_STATUSES);
                }

                outfit.setStatus(normalizedStatus);
                Outfit saved = outfitRepository.save(outfit);
                log.info("Updated status to {} for outfit {} (user {})", normalizedStatus, outfitId, userId);
                return mapToResponse(saved);
        }

        @Transactional
        public OutfitResponse regenerateOutfit(UUID userId, UUID outfitId) {
                Outfit original = outfitRepository.findByIdAndUserId(outfitId, userId)
                                .orElseThrow(() -> new ResourceNotFoundException("Outfit", "id", outfitId));

                // Automatic outfit → regenerate using same occasion
                if ("AUTOMATIC_RULE_ENGINE".equalsIgnoreCase(original.getSource())) {
                        String occasion = original.getOccasion() != null ? original.getOccasion() : "CASUAL";
                        GenerateAutomaticOutfitRequest req = GenerateAutomaticOutfitRequest.builder()
                                        .occasion(occasion)
                                        .name("Regenerated " + original.getName())
                                        .build();
                        return generateAutomaticOutfit(userId, req);
                }

                // Controlled or manual outfit → gather categories and regenerate controlled
                List<String> categories = original.getItems().stream()
                                .map(i -> i.getWardrobeItem().getCategory())
                                .filter(c -> c != null && !c.isBlank())
                                .distinct()
                                .collect(Collectors.toList());

                if (categories.isEmpty()) {
                        categories = Arrays.asList("TOPS", "BOTTOMS");
                }

                GenerateControlledOutfitRequest req = GenerateControlledOutfitRequest.builder()
                                .categories(categories)
                                .name("Regenerated " + original.getName())
                                .build();
                return generateControlledOutfit(userId, req);
        }

        @Transactional
        public OutfitResponse updateOutfit(UUID userId, UUID outfitId, UpdateOutfitRequest request) {
                Outfit outfit = outfitRepository.findByIdAndUserId(outfitId, userId)
                                .orElseThrow(() -> new ResourceNotFoundException("Outfit", "id", outfitId));

                if (request.getName() != null && !request.getName().isBlank()) {
                        outfit.setName(request.getName().trim());
                }
                if (request.getIsFavorite() != null) {
                        outfit.setFavorite(request.getIsFavorite());
                }
                if (request.getStatus() != null && !request.getStatus().isBlank()) {
                        String status = request.getStatus().trim().toUpperCase();
                        if (!VALID_STATUSES.contains(status)) {
                                throw new BadRequestException(
                                                "Invalid status: " + status + ". Allowed: " + VALID_STATUSES);
                        }
                        outfit.setStatus(status);
                }

                Outfit saved = outfitRepository.save(outfit);
                log.info("Updated outfit {} for user {}", outfitId, userId);
                return mapToResponse(saved);
        }

        @Transactional(readOnly = true)
        public List<OutfitResponse> listOutfits(UUID userId, String status, Boolean isFavorite, String source) {
                List<Outfit> outfits = outfitRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
                return outfits.stream()
                                .filter(o -> status == null || status.isBlank()
                                                || o.getStatus().equalsIgnoreCase(status.trim()))
                                .filter(o -> isFavorite == null || o.isFavorite() == isFavorite)
                                .filter(o -> source == null || source.isBlank()
                                                || o.getSource().equalsIgnoreCase(source.trim()))
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public OutfitResponse getOutfit(UUID userId, UUID outfitId) {
                Outfit outfit = outfitRepository.findByIdAndUserId(outfitId, userId)
                                .orElseThrow(() -> new ResourceNotFoundException("Outfit", "id", outfitId));
                return mapToResponse(outfit);
        }

        @Transactional
        public void deleteOutfit(UUID userId, UUID outfitId) {
                Outfit outfit = outfitRepository.findByIdAndUserId(outfitId, userId)
                                .orElseThrow(() -> new ResourceNotFoundException("Outfit", "id", outfitId));
                outfitRepository.delete(outfit);
                log.info("Deleted outfit {} for user {}", outfitId, userId);
        }

        // -------------------------------------------------------------------------
        // Response mapping
        // -------------------------------------------------------------------------

        public OutfitResponse mapToResponse(Outfit outfit) {
                List<WardrobeItemResponse> itemResponses = outfit.getItems() != null
                                ? outfit.getItems().stream()
                                                .map(OutfitItem::getWardrobeItem)
                                                .map(wardrobeService::mapToResponse)
                                                .collect(Collectors.toList())
                                : new ArrayList<>();

                return OutfitResponse.builder()
                                .id(outfit.getId())
                                .userId(outfit.getUser().getId())
                                .name(outfit.getName())
                                .source(outfit.getSource())
                                .status(outfit.getStatus())
                                .occasion(outfit.getOccasion())
                                .isFavorite(outfit.isFavorite())
                                .items(itemResponses)
                                .createdAt(outfit.getCreatedAt())
                                .updatedAt(outfit.getUpdatedAt())
                                .build();
        }
}
