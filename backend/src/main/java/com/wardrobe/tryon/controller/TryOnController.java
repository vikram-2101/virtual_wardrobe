package com.wardrobe.tryon.controller;

import com.wardrobe.common.dto.ApiResponse;
import com.wardrobe.common.security.CustomUserDetails;
import com.wardrobe.tryon.dto.CreateSingleItemTryOnRequest;
import com.wardrobe.tryon.dto.CreateTryOnJobRequest;
import com.wardrobe.tryon.dto.TryOnJobResponse;
import com.wardrobe.tryon.entity.TryOnJobStatus;
import com.wardrobe.tryon.service.TryOnService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/try-ons")
@RequiredArgsConstructor
public class TryOnController {

    private final TryOnService tryOnService;

    @PostMapping
    public ResponseEntity<ApiResponse<TryOnJobResponse>> createTryOnJob(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateTryOnJobRequest request) {
        TryOnJobResponse response = tryOnService.createJob(userDetails.getId(), request);
        return new ResponseEntity<>(ApiResponse.ok("Try-on job submitted successfully", response), HttpStatus.CREATED);
    }

    @PostMapping("/single-item")
    public ResponseEntity<ApiResponse<TryOnJobResponse>> createSingleItemTryOnJob(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateSingleItemTryOnRequest request) {
        TryOnJobResponse response = tryOnService.createSingleItemJob(userDetails.getId(), request);
        return new ResponseEntity<>(ApiResponse.ok("Single item try-on job submitted successfully", response),
                HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TryOnJobResponse>>> listTryOnJobs(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) TryOnJobStatus status) {
        List<TryOnJobResponse> response = tryOnService.listJobs(userDetails.getId(), status);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TryOnJobResponse>> getTryOnJob(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") UUID jobId) {
        TryOnJobResponse response = tryOnService.getJob(userDetails.getId(), jobId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
