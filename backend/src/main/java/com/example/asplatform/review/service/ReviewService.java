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

    // 관리자 혹은 자기 자신만 삭제 가능
    @Transactional
    public void deleteReview(Long reviewId, Long requesterId) {
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("요청 사용자 없음"));

        String role = requester.getRole().name(); // 'USER','ENGINEER','CUSTOMER','ADMIN'

        //  CUSTOMER(고객사 관리자): 같은 고객사 소속 리뷰만 삭제 허용
        if ("CUSTOMER".equals(role)) {
            Long customerId = requester.getCustomer().getId(); // PK명에 맞춰 getCustomerId()일 수도 있음
            boolean sameCustomer =
                    reviewRepository.existsByReviewIdAndRepair_Request_RepairableItem_Customer_Id(reviewId, customerId)
                    // ↓ 만약 Customer PK가 customerId라면 위 대신 아래를 사용
                    // reviewRepository.existsByReviewIdAndRepair_Request_RepairableItem_Customer_Customer_Id(reviewId, customerId)
                    ;

            if (!sameCustomer) {
                throw new AccessDeniedException("해당 고객사 소속 리뷰만 삭제할 수 있습니다.");
            }
            reviewRepository.deleteById(reviewId);
            return;
        }

        //  그 외 역할(USER/ENGINEER 등): 작성자 본인만 삭제 허용
        boolean isOwner = reviewRepository.existsByReviewIdAndUser_Id(reviewId, requesterId);
        if (!isOwner) {
            throw new AccessDeniedException("내가 작성한 리뷰만 삭제할 수 있습니다.");
        }

        reviewRepository.deleteById(reviewId);
    }


    // 고객사 별 리뷰 찾기
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByCustomer(Long customerId, Pageable pageable) {
        return reviewRepository.findByCustomerReviews(customerId, pageable);
    }

     // Review → ReviewResponseDTO 변환
     private ReviewResponse toResponse(Review r) {
         return ReviewResponse.builder()
                 .reviewId(r.getReviewId())
                 .repairId(r.getRepair().getId())
                 ///.repairTitle(r.getRepair().getRequest().getTitle())
                 .username(r.getUser().getName())
                 .rating(r.getRating())
                 .reviewContent(r.getReviewContent())
                 .createdAt(r.getCreatedAt())
                 .build();
     }

}
