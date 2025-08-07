package com.example.asplatform.review.repository;

import com.example.asplatform.review.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findAllByRepair_EngineerId(Long engineerId);
    List<Review> findAllByRepair_CustomerId(Long customerId);
}
