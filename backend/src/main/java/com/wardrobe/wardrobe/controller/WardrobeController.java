package com.wardrobe.wardrobe.controller;

import com.wardrobe.common.dto.ApiResponse;
import com.wardrobe.common.exception.BadRequestException;
import com.wardrobe.common.security.CustomUserDetails;
import com.wardrobe.wardrobe.dto.CreateWardrobeItemRequest;
import com.wardrobe.wardrobe.dto.SuggestMetadataResponse;
import com.wardrobe.wardrobe.dto.UpdateWardrobeItemRequest;
import com.wardrobe.wardrobe.dto.WardrobeItemResponse;
import com.wardrobe.wardrobe.service.AiServiceClient;
import com.wardrobe.wardrobe.service.WardrobeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/wardrobe")
@RequiredArgsConstructor
public class WardrobeController {

        private final WardrobeService wardrobeService;
        private final AiServiceClient aiServiceClient;

        private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
                        "image/jpeg", "image/png", "image/webp", "image/jpg");

        @PostMapping(value = { "/suggest-metadata",
                        "/items/suggest-metadata" }, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<ApiResponse<SuggestMetadataResponse>> suggestMetadata(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @RequestParam("file") MultipartFile file) {
                if (file == null || file.isEmpty()) {
                        throw new BadRequestException("Image file is required for metadata extraction");
                }
                if (file.getSize() > 10 * 1024 * 1024) {
                        throw new BadRequestException("Image file size exceeds maximum limit of 10MB");
                }
                String contentType = file.getContentType();
                if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
                        throw new BadRequestException("Invalid file type. Only JPG, PNG, and WEBP images are allowed.");
                }

                SuggestMetadataResponse response = aiServiceClient.extractMetadata(file);
                return ResponseEntity.ok(ApiResponse.ok("Metadata suggestions generated successfully", response));
        }

        @PostMapping(value = { "/items", "" }, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<ApiResponse<WardrobeItemResponse>> createItem(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @Valid @ModelAttribute CreateWardrobeItemRequest request,
                        @RequestParam("frontImage") MultipartFile frontImage,
                        @RequestParam(value = "backImage", required = false) MultipartFile backImage) {
                WardrobeItemResponse response = wardrobeService.createItem(
                                userDetails.getId(),
                                request,
                                frontImage,
                                backImage);
                return new ResponseEntity<>(ApiResponse.ok("Wardrobe item created successfully", response),
                                HttpStatus.CREATED);
        }

        @GetMapping(value = { "/items", "" })
        public ResponseEntity<ApiResponse<List<WardrobeItemResponse>>> listItems(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @RequestParam(value = "category", required = false) String category) {
                List<WardrobeItemResponse> response = wardrobeService.listItems(userDetails.getId(), category);
                return ResponseEntity.ok(ApiResponse.ok(response));
        }

        @GetMapping(value = { "/items/{id}", "/{id}" })
        public ResponseEntity<ApiResponse<WardrobeItemResponse>> getItem(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable("id") UUID itemId) {
                WardrobeItemResponse response = wardrobeService.getItem(userDetails.getId(), itemId);
                return ResponseEntity.ok(ApiResponse.ok(response));
        }

        @PutMapping(value = { "/items/{id}", "/{id}" }, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<ApiResponse<WardrobeItemResponse>> updateItem(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable("id") UUID itemId,
                        @Valid @ModelAttribute UpdateWardrobeItemRequest request,
                        @RequestParam(value = "frontImage", required = false) MultipartFile frontImage,
                        @RequestParam(value = "backImage", required = false) MultipartFile backImage) {
                WardrobeItemResponse response = wardrobeService.updateItem(
                                userDetails.getId(),
                                itemId,
                                request,
                                frontImage,
                                backImage);
                return ResponseEntity.ok(ApiResponse.ok("Wardrobe item updated successfully", response));
        }

        @DeleteMapping(value = { "/items/{id}", "/{id}" })
        public ResponseEntity<ApiResponse<Void>> deleteItem(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable("id") UUID itemId) {
                wardrobeService.deleteItem(userDetails.getId(), itemId);
                return ResponseEntity.ok(ApiResponse.ok("Wardrobe item deleted successfully", null));
        }
}
