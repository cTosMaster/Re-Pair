package com.example.asplatform.review.controller;

import com.example.asplatform.auth.service.CustomUserDetails;
import com.example.asplatform.review.dto.requestDTO.ReviewRequest;
import com.example.asplatform.review.dto.responseDTO.ReviewResponse;
import com.example.asplatform.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    public ResponseEntity<Page<ReviewResponse>> getMyReviews(
            @AuthenticationPrincipal CustomUserDetails user,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
            @ParameterObject Pageable pageable // swagger용

    ) {
        return ResponseEntity.ok(reviewService.getReviewsByUser(user.getId(), pageable));
    }

    // 고객사별 리뷰 찾기
    @GetMapping("/customers/{customerId}/reviews")
    public ResponseEntity<Page<ReviewResponse>> getCustomerReviews(
            @PathVariable Long customerId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
            @ParameterObject Pageable pageable
    ) {
        return ResponseEntity.ok(reviewService.getReviewsByCustomer(customerId, pageable));
    }

    // 수리건별 후기 조회
    @GetMapping("/{repairId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByRepair(
            @PathVariable Long repairId
    ) {
        return ResponseEntity.ok(reviewService.getReviewsByRepairId(repairId));
    }

    // 리뷰 삭제
    @DeleteMapping("/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        reviewService.deleteReview(reviewId, user.getId());
        return ResponseEntity.noContent().build();
    }

}
