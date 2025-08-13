package com.example.asplatform.review.repository;

import com.example.asplatform.review.domain.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByRepair_Id(Long repairId);
    List<Review> findByUserId(Long userId);
    // 고객사별 리뷰 (페이징). to-one만 fetch join이라 페이징 가능
    /**@Query(
            value = """
        select rv
        from Review rv
          join fetch rv.user u
          join fetch rv.repair rp
          join rp.repairRequest rr
          join rr.engineer engUser
          join Engineer eng on eng.userId = engUser.id
        where eng.customerId = :customerId
      """,
            countQuery = """
        select count(rv)
        from Review rv
          join rv.repair rp
          join rp.repairRequest rr
          join rr.engineer engUser
          join Engineer eng on eng.userId = engUser.id
        where eng.customerId = :customerId
      """
    )
    Page<Review> findByCustomerId(@Param("customerId") Long customerId, Pageable pageable);**/
}

