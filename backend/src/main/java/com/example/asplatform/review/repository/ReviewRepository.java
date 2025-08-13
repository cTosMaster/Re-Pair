package com.example.asplatform.review.repository;

import com.example.asplatform.review.domain.Review;
import com.example.asplatform.review.dto.responseDTO.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByRepair_Id(Long repairId);

    /** 후기 중복 방지용 */
    boolean existsByRepair_IdAndUser_Id(Long repairId, Long userId);

    /** 작성자 본인 여부 */
    boolean existsByReviewIdAndUser_Id(Long reviewId, Long userId);

    /** 같은 고객사 소속 리뷰인지 */
    boolean existsByReviewIdAndRepair_Request_RepairableItem_Customer_Id(Long reviewId, Long customerId);


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

