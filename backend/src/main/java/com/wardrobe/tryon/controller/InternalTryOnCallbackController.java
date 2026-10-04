package com.wardrobe.tryon.controller;

import com.wardrobe.common.dto.ApiResponse;
import com.wardrobe.tryon.dto.TryOnCallbackRequest;
import com.wardrobe.tryon.dto.TryOnJobResponse;
import com.wardrobe.tryon.service.TryOnService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/internal/try-ons")
@RequiredArgsConstructor
public class InternalTryOnCallbackController {

    private final TryOnService tryOnService;

    @PostMapping("/callback")
    public ResponseEntity<ApiResponse<TryOnJobResponse>> processCallback(
            @RequestHeader(value = "X-Internal-Secret", required = false) String secretHeader,
            @Valid @RequestBody TryOnCallbackRequest request) {
        TryOnJobResponse response = tryOnService.processCallback(secretHeader, request);
        return ResponseEntity.ok(ApiResponse.ok("Try-on job callback processed successfully", response));
    }
}
