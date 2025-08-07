package com.example.asplatform.review.controller;

import com.example.asplatform.review.dto.requestDTO.ReviewRequest;
import com.example.asplatform.review.dto.responseDTO.ReviewResponse;
import com.example.asplatform.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    // 추후 CustomUserDetails 사용
    @PostMapping("/{repairId}")
    public ResponseEntity<Void> createReview(
            @PathVariable Long repairId,
            @RequestBody ReviewRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        reviewService.createReview(request, userDetails.getUser().getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{repairId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByRepair(@PathVariable Long repairId) {
        return ResponseEntity.ok(reviewService.getReviewsByRepairId(repairId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ReviewResponse>> getMyReviews(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(reviewService.getReviewsByUser(userDetails.getUser().getId()));
    }
}
