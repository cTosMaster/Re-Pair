package com.example.asplatform.review.repository;

import com.example.asplatform.review.domain.Review;
import com.example.asplatform.review.dto.responseDTO.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
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

    /** 현재 페이지 ID 평균 계산 */
    @Query("""
       select i.customer.id as customerId,
              avg(r.rating)   as avgRating
       from Review r
         join r.repair rp
         join rp.request rq
         join rq.repairableItem i
       where i.customer.id in :customerIds
       group by i.customer.id
    """)
    List<ReviewAvg> avgByCustomerIds(@Param("customerIds") Collection<Long> customerIds);

    /** 지역/카테고리/키워드 필터 + 리뷰없는 업체 0점 포함 + 평균별점 내림차순 + 페이징 **/
    @Query(
            value = """
    SELECT
      c.customer_id                 AS customerId,
      IFNULL(AVG(rv.rating), 0)     AS avgRating
    FROM customers c
    LEFT JOIN customer_addresses ca ON ca.customer_id = c.customer_id
    LEFT JOIN repairable_items i    ON i.customer_id = c.customer_id
    LEFT JOIN repair_requests rq    ON rq.item_id = i.item_id
    LEFT JOIN repairs rp            ON rp.request_id = rq.request_id     -- ⬅️ 여기 수정
    LEFT JOIN reviews rv            ON rv.repair_id = rp.repair_id
    WHERE (:si IS NULL OR ca.road_address LIKE CONCAT(:si, '%'))
      AND (:gu IS NULL OR ca.road_address LIKE CONCAT(:si, ' ', :gu, '%'))
      AND (:keyword IS NULL OR c.company_name LIKE CONCAT('%', :keyword, '%'))
      AND (
        :platformCategoryId IS NULL
        OR EXISTS (
          SELECT 1
          FROM customer_categories cc
          JOIN platform_categories pc
            ON LOWER(pc.name) = LOWER(cc.name)
          WHERE cc.customer_id = c.customer_id
            AND cc.is_deleted = FALSE
            AND pc.category_id = :platformCategoryId
        )
      )
      AND c.status = 'APPROVED'
    GROUP BY c.customer_id
    ORDER BY avgRating DESC
  """,
            countQuery = """
    SELECT COUNT(DISTINCT c.customer_id)
    FROM customers c
    LEFT JOIN customer_addresses ca ON ca.customer_id = c.customer_id
    WHERE (:si IS NULL OR ca.road_address LIKE CONCAT(:si, '%'))
      AND (:gu IS NULL OR ca.road_address LIKE CONCAT(:si, ' ', :gu, '%'))
      AND (:keyword IS NULL OR c.company_name LIKE CONCAT('%', :keyword, '%'))
      AND (
        :platformCategoryId IS NULL
        OR EXISTS (
          SELECT 1
          FROM customer_categories cc
          JOIN platform_categories pc
            ON LOWER(pc.name) = LOWER(cc.name)
          WHERE cc.customer_id = c.customer_id
            AND cc.is_deleted = FALSE
            AND pc.category_id = :platformCategoryId
        )
      )
      AND c.status = 'APPROVED'
  """,
            nativeQuery = true
    )
    Page<ReviewAvg> findAvgPageDesc(
            @Param("si") String si,
            @Param("gu") String gu,
            @Param("platformCategoryId") Long platformCategoryId,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}

