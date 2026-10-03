package com.wardrobe.outfit.controller;

import com.wardrobe.common.dto.ApiResponse;
import com.wardrobe.common.security.CustomUserDetails;
import com.wardrobe.outfit.dto.*;
import com.wardrobe.outfit.service.OutfitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/outfits")
@RequiredArgsConstructor
public class OutfitController {

    private final OutfitService outfitService;

    @PostMapping("/generate-automatic")
    public ResponseEntity<ApiResponse<OutfitResponse>> generateAutomaticOutfit(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody GenerateAutomaticOutfitRequest request) {
        OutfitResponse response = outfitService.generateAutomaticOutfit(userDetails.getId(), request);
        return new ResponseEntity<>(ApiResponse.ok("Automatic outfit generated successfully", response),
                HttpStatus.CREATED);
    }

    @PostMapping("/generate-controlled")
    public ResponseEntity<ApiResponse<OutfitResponse>> generateControlledOutfit(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody GenerateControlledOutfitRequest request) {
        OutfitResponse response = outfitService.generateControlledOutfit(userDetails.getId(), request);
        return new ResponseEntity<>(ApiResponse.ok("Controlled outfit generated successfully", response),
                HttpStatus.CREATED);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OutfitResponse>> createManualOutfit(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateOutfitRequest request) {
        OutfitResponse response = outfitService.createManualOutfit(userDetails.getId(), request);
        return new ResponseEntity<>(ApiResponse.ok("Outfit created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OutfitResponse>>> listOutfits(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean isFavorite,
            @RequestParam(required = false) String source) {
        List<OutfitResponse> response = outfitService.listOutfits(userDetails.getId(), status, isFavorite, source);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OutfitResponse>> getOutfit(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") UUID outfitId) {
        OutfitResponse response = outfitService.getOutfit(userDetails.getId(), outfitId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OutfitResponse>> updateOutfit(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") UUID outfitId,
            @Valid @RequestBody UpdateOutfitRequest request) {
        OutfitResponse response = outfitService.updateOutfit(userDetails.getId(), outfitId, request);
        return ResponseEntity.ok(ApiResponse.ok("Outfit updated successfully", response));
    }

    @PutMapping("/{id}/favorite")
    public ResponseEntity<ApiResponse<OutfitResponse>> toggleFavorite(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") UUID outfitId,
            @RequestParam(required = false) Boolean isFavorite) {
        OutfitResponse response = outfitService.toggleFavorite(userDetails.getId(), outfitId, isFavorite);
        return ResponseEntity.ok(ApiResponse.ok("Outfit favorite status updated successfully", response));
    }

    @PutMapping("/{id}/save")
    public ResponseEntity<ApiResponse<OutfitResponse>> saveOutfit(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") UUID outfitId) {
        OutfitResponse response = outfitService.updateStatus(userDetails.getId(), outfitId, "SAVED");
        return ResponseEntity.ok(ApiResponse.ok("Outfit saved successfully", response));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<OutfitResponse>> rejectOutfit(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") UUID outfitId) {
        OutfitResponse response = outfitService.updateStatus(userDetails.getId(), outfitId, "REJECTED");
        return ResponseEntity.ok(ApiResponse.ok("Outfit rejected successfully", response));
    }

    @PostMapping("/{id}/regenerate")
    public ResponseEntity<ApiResponse<OutfitResponse>> regenerateOutfit(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") UUID outfitId) {
        OutfitResponse response = outfitService.regenerateOutfit(userDetails.getId(), outfitId);
        return new ResponseEntity<>(ApiResponse.ok("Outfit regenerated successfully", response), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOutfit(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") UUID outfitId) {
        outfitService.deleteOutfit(userDetails.getId(), outfitId);
        return ResponseEntity.ok(ApiResponse.ok("Outfit deleted successfully", null));
    }
}
