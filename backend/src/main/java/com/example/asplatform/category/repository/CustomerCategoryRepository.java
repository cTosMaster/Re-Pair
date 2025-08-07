package com.example.asplatform.category.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.example.asplatform.category.domain.CustomerCategory;

import java.util.List;

public interface CustomerCategoryRepository extends JpaRepository<CustomerCategory, Long> {

    // 고객사 ID로 해당 고객사의 카테고리 목록 조회
    List<CustomerCategory> findByCustomerId(Long customerId);
}