package com.example.asplatform.review.service;

import com.example.asplatform.repair.domain.Repair;
import com.example.asplatform.repair.repository.RepairRepository;
import com.example.asplatform.review.domain.Review;
import com.example.asplatform.review.dto.requestDTO.ReviewRequest;
import com.example.asplatform.review.dto.responseDTO.ReviewResponse;
import com.example.asplatform.review.repository.ReviewRepository;
import com.example.asplatform.user.domain.User;
import com.example.asplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final RepairRepository repairRepository;
    private final UserRepository userRepository;

    // 후기 작성
    public void createReview(Long repairId, ReviewRequest request, Long userId) {
        Repair repair = repairRepository.findById(repairId)
                .orElseThrow(() -> new IllegalArgumentException("수리건 없음"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저 없음"));

        Review review = Review.builder()
                .repair(repair)
                .user(user)
                .rating(request.getRating())
                .reviewContent(request.getReviewContent())
                .createdAt(LocalDateTime.now())
                .build();

        reviewRepository.save(review);
    }

    // 유저(개인) 후기 조회
    public List<ReviewResponse> getReviewsByUser(Long userId) {
        return reviewRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // 수리건 기준 조회
    public List<ReviewResponse> getReviewsByRepairId(Long repairId) {
        return reviewRepository.findByRepair_Id(repairId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

     // Review → ReviewResponseDTO 변환
    private ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .reviewId(review.getReviewId())
                .repairId(review.getRepair().getId())  // ⚠️ 필드명이 repairId가 아닌 id일 경우
                .username(review.getUser().getName())
                .rating(review.getRating())
                .reviewContent(review.getReviewContent())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
