package com.example.asplatform.review.repository;

import com.example.asplatform.review.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByRepair_Id(Long repairId);
    List<Review> findByUserId(Long userId);
}
