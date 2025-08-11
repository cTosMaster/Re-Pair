package com.example.asplatform.category.repository;

import com.example.asplatform.category.domain.CustomerCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomerCategoryRepository extends JpaRepository<CustomerCategory, Long> {
    List<CustomerCategory> findByCustomerId(Long customerId);
}
