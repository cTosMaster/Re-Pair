package com.example.asplatform.review.service;

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

    public void createReview(ReviewRequest request, Long userId) {
        Repair repair = repairRepository.findById(request.getRepairId())
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

    public List<ReviewResponse> getReviewsByRepairId(Long repairId) {
        return reviewRepository.findByRepairRepairId(repairId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getReviewsByUser(Long userId) {
        return reviewRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .reviewId(review.getReviewId())
                .repairId(review.getRepair().getRepairId())
                .username(review.getUser().getName())
                .rating(review.getRating())
                .reviewContent(review.getReviewContent())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
