package com.example.asplatform.review.controller;

import com.example.asplatform.auth.service.CustomUserDetails;
import com.example.asplatform.review.dto.requestDTO.ReviewRequest;
import com.example.asplatform.review.dto.responseDTO.ReviewResponse;
import com.example.asplatform.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // 후기 작성
    @PostMapping("/{repairId}")
    public ResponseEntity<Void> createReview(
            @PathVariable Long repairId,
            @RequestBody ReviewRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        reviewService.createReview(repairId, request, userDetails.getId());
        return ResponseEntity.ok().build();
    }

    // 내 후기 조회
    @GetMapping("/my")
    public ResponseEntity<List<ReviewResponse>> getMyReviews(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(reviewService.getReviewsByUser(userDetails.getId()));
    }

    // 수리건별 후기 조회
    @GetMapping("/{repairId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByRepair(
            @PathVariable Long repairId
    ) {
        return ResponseEntity.ok(reviewService.getReviewsByRepairId(repairId));
    }

    @DeleteMapping("/api/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal CustomUserDetails me // 또는 Long userId
    ) {
        reviewService.deleteReview(reviewId, me.getId());
        return ResponseEntity.noContent().build();
    }
}
