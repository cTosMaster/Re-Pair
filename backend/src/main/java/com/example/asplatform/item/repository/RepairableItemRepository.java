package com.example.asplatform.item.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.asplatform.item.domain.RepairableItem;

@Repository
public interface RepairableItemRepository extends JpaRepository<RepairableItem, Long> {

    // 고객사 카테고리 기준으로 항목 조회
    List<RepairableItem> findByCategoryId(Long categoryId);

    // 고객사 전체 항목 조회
    List<RepairableItem> findByCustomerId(Long customerId);

    // 고객사 + 카테고리 기준 조회
    List<RepairableItem> findByCustomerIdAndCategoryId(Long customerId, Long categoryId);
}