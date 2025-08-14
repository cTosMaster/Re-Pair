package com.example.asplatform.review.repository;

import com.example.asplatform.review.domain.Review;
import com.example.asplatform.review.dto.responseDTO.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByRepair_Id(Long repairId);
    Optional<Review> findByReviewIdAndUser_Id(Long reviewId, Long userId); // 작성자 본인 소유 리뷰만 로드
    /** 후기 중복 방지용 */
    boolean existsByRepair_IdAndUser_Id(Long repairId, Long userId);

    // 작성자 본인만 삭제 (작성자 userId와 reviewId가 모두 일치할 때만 삭제)
    int deleteByReviewIdAndUser_Id(Long reviewId, Long userId);

    int deleteByReviewIdAndRepair_Request_RepairableItem_Customer_Id(Long reviewId, Long customerId);

    // 존재 유무 확인(404/403 구분)
    boolean existsById(Long reviewId);

    /** 후기 이름 추가를 위한 쿼리 */
    @Query(
            value = """
    select new com.example.asplatform.review.dto.responseDTO.ReviewResponse(
      r.reviewId,
      rep.id,
      req.title,
      u.name,
      r.rating,
      r.reviewContent,
      r.createdAt
    )
    from Review r
    join r.repair rep
    join rep.request req
    join r.user u
    where u.id = :userId
  """,
            countQuery = """
    select count(r)
    from Review r
    join r.user u
    where u.id = :userId
  """
    )
    Page<ReviewResponse> findByUserIdWithTitle(@Param("userId") Long userId, Pageable pageable);


    /** 고객사별 후기를 찾기 위한 쿼리 */
    @Query(
            value = """
    select new com.example.asplatform.review.dto.responseDTO.ReviewResponse(
      r.reviewId,
      rep.id,
      req.title,
      u.name,
      r.rating,
      r.reviewContent,
      r.createdAt
    )
    from Review r
      join r.repair rep
      join rep.request req
      join req.repairableItem item
      join item.customer cust
      join r.user u
    where cust.id = :customerId
  """,
            countQuery = """
    select count(r)
    from Review r
      join r.repair rep
      join rep.request req
      join req.repairableItem item
      join item.customer cust
    where cust.id = :customerId
  """
    )
    Page<ReviewResponse> findByCustomerReviews(@Param("customerId") Long customerId, Pageable pageable);

}

