package com.example.asplatform.category.repository;

import com.example.asplatform.category.domain.CustomerCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomerCategoryRepository extends JpaRepository<CustomerCategory, Long> {
    List<CustomerCategory> findByCustomerId(Long customerId);
    void deleteByCustomerId(Long customerId);
    // 고객사별 전체 목록 (페이징)
    Page<CustomerCategory> findByCustomerId(Long customerId, Pageable pageable);

    // 고객사별 이름 검색 (페이징)
    Page<CustomerCategory> findByCustomerIdAndNameContainingIgnoreCase(Long customerId, String name, Pageable pageable);

    // (옵션) 전체 검색이 필요하면 관리자용
    Page<CustomerCategory> findByNameContainingIgnoreCase(String name, Pageable pageable);

    // (옵션) 키워드 비었을 때 사용할 수 있는 기본 목록
    Page<CustomerCategory> findAllBy(Pageable pageable);
}
