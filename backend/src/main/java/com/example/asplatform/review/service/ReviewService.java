package com.example.asplatform.review.service;

import com.example.asplatform.common.enums.Role;
import com.example.asplatform.customer.domain.Customer;
import com.example.asplatform.repair.domain.Repair;
import com.example.asplatform.repair.repository.RepairRepository;
import com.example.asplatform.review.domain.Review;
import com.example.asplatform.review.dto.requestDTO.ReviewRequest;
import com.example.asplatform.review.dto.requestDTO.ReviewUpdateRequest;
import com.example.asplatform.review.dto.responseDTO.ReviewResponse;
import com.example.asplatform.review.repository.ReviewRepository;
import com.example.asplatform.user.domain.User;
import com.example.asplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    // ReviewService
    @Transactional
    public void createReview(Long repairId, ReviewRequest request, Long userId) {
        // 1) 소유자 검증
        if (!repairRepository.existsByIdAndRequest_User_Id(repairId, userId)) {
            throw new AccessDeniedException("내가 요청한 수리건이 아닙니다.");
        }
        // 2) 중복 방지
        if (reviewRepository.existsByRepair_IdAndUser_Id(repairId, userId)) {
            throw new IllegalStateException("이미 해당 수리건에 대한 후기를 작성했습니다.");
        }
        // 3) (선택) 완료 후만 허용
        Repair repair = repairRepository.findById(repairId)
                .orElseThrow(() -> new IllegalArgumentException("수리건 없음"));
        if (repair.getCompletedAt() == null) {
            throw new IllegalStateException("수리 완료 후에만 후기를 작성할 수 있습니다.");
        }

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
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByUser(Long userId, Pageable pageable) {
        return reviewRepository.findByUserIdWithTitle(userId, pageable);
    }

    // 수리건 기준 조회
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByRepairId(Long repairId) {
        return reviewRepository.findByRepair_Id(repairId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteReview(Long reviewId, Long requesterId) {
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("요청 사용자 없음"));

        int deleted;
        if (requester.getRole() == Role.CUSTOMER) {
            Customer customer = requester.getCustomer();
            if (customer == null) throw new AccessDeniedException("고객사 정보가 없어 삭제할 수 없습니다.");

            deleted = reviewRepository
                    .deleteByReviewIdAndRepair_Request_RepairableItem_Customer_Id(reviewId, customer.getId());
        } else {
            deleted = reviewRepository.deleteByReviewIdAndUser_Id(reviewId, requesterId);
        }

        if (deleted == 0) throw new AccessDeniedException("삭제 권한이 없습니다.");
    }



    // 고객사 별 리뷰 찾기
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByCustomer(Long customerId, Pageable pageable) {
        return reviewRepository.findByCustomerReviews(customerId, pageable);
    }

    @Transactional
    public ReviewResponse updateReview(Long reviewId, Long meId, ReviewUpdateRequest req) {
        if (req.getRating() == null && req.getReviewContent() == null) {
            throw new IllegalArgumentException("수정할 값이 없습니다.");
        }

        // 내가 쓴 리뷰만 조회 (없으면 404 또는 403 성격)
        Review review = reviewRepository.findByReviewIdAndUser_Id(reviewId, meId)
                .orElseThrow(() -> new AccessDeniedException("내가 작성한 리뷰만 수정할 수 있습니다."));

        if (req.getRating() != null) {
            int rating = req.getRating();
            if (rating < 1 || rating > 5) throw new IllegalArgumentException("평점은 1~5 사이여야 합니다.");
            review.setRating(rating);
        }
        if (req.getReviewContent() != null) {
            review.setReviewContent(req.getReviewContent());
        }

        return toResponse(reviewRepository.save(review));
    }


    // Review → ReviewResponseDTO 변환
     private ReviewResponse toResponse(Review r) {
         return ReviewResponse.builder()
                 .reviewId(r.getReviewId())
                 .repairId(r.getRepair().getId())
                 .repairTitle(r.getRepair().getRequest().getTitle())
                 .username(r.getUser().getName())
                 .rating(r.getRating())
                 .reviewContent(r.getReviewContent())
                 .createdAt(r.getCreatedAt())
                 .build();
     }

}
