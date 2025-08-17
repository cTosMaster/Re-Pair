package com.example.asplatform.item.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.asplatform.item.domain.RepairableItem;

@Repository
public interface RepairableItemRepository extends JpaRepository<RepairableItem, Long> {

	//제품 id로 제품 조회하기
	Optional<RepairableItem> findById(Long id);
		
    // 고객사 카테고리 기준으로 항목 조회
    List<RepairableItem> findByCategoryId(Long categoryId);

    // 고객사 전체 항목 조회
    List<RepairableItem> findByCustomerId(Long customerId);

    // 고객사 + 카테고리 기준 조회
    List<RepairableItem> findByCustomerIdAndCategoryId(Long customerId, Long categoryId);

    // cascade 형식으로 지우기 위한 쿼리
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
      update RepairableItem i
         set i.deleted = true
       where i.category.id = :categoryId
         and i.deleted = false
    """)
    int softDeleteByCategoryId(@Param("categoryId") Long categoryId);

    // is_deleted 확인 쿼리
    @Query(value = "select is_deleted from repairable_items where item_id = :itemId", nativeQuery = true)
    Optional<Boolean> selectIsDeleted(@Param("itemId") Long itemId);

}