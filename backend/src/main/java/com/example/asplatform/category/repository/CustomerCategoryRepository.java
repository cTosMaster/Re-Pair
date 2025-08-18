package com.example.asplatform.category.repository;

import com.example.asplatform.category.domain.CustomerCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;



public interface CustomerCategoryRepository extends JpaRepository<CustomerCategory, Long> {
    void deleteByCustomerId(Long customerId);
    Page<CustomerCategory> findByCustomerId(Long customerId, Pageable pageable);
    Page<CustomerCategory> findByCustomerIdAndNameContainingIgnoreCase(
            Long customerId, String name, Pageable pageable);
}