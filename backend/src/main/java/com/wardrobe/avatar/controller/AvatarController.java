package com.wardrobe.avatar.controller;

import com.wardrobe.avatar.dto.AvatarResponse;
import com.wardrobe.avatar.service.AvatarService;
import com.wardrobe.common.dto.ApiResponse;
import com.wardrobe.common.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/avatars")
@RequiredArgsConstructor
public class AvatarController {

    private final AvatarService avatarService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AvatarResponse>> uploadAvatar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("file") MultipartFile file) {
        AvatarResponse response = avatarService.uploadAvatar(userDetails.getId(), file);
        return new ResponseEntity<>(ApiResponse.ok("Avatar uploaded successfully", response), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AvatarResponse>>> listAvatars(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<AvatarResponse> response = avatarService.listUserAvatars(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/canonical")
    public ResponseEntity<ApiResponse<AvatarResponse>> getCanonicalAvatar(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        AvatarResponse response = avatarService.getCanonicalAvatar(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}/canonical")
    public ResponseEntity<ApiResponse<AvatarResponse>> setCanonicalAvatar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") UUID avatarId) {
        AvatarResponse response = avatarService.setCanonicalAvatar(userDetails.getId(), avatarId);
        return ResponseEntity.ok(ApiResponse.ok("Canonical avatar updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAvatar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") UUID avatarId) {
        avatarService.deleteAvatar(userDetails.getId(), avatarId);
        return ResponseEntity.ok(ApiResponse.ok("Avatar deleted successfully", null));
    }
}
