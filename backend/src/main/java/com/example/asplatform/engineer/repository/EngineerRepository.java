package com.example.asplatform.engineer.repository;

import com.example.asplatform.engineer.domain.Engineer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;


public interface EngineerRepository extends JpaRepository<Engineer, Long> {
    // 전체 목록 전역 검색 + 페이징
    Page<Engineer> findDistinctByUser_NameContainingIgnoreCaseOrUser_EmailContainingIgnoreCaseOrUser_PhoneContainingIgnoreCase(
            String kw1, String kw2, String kw3, Pageable pageable);

    // 고객사 전용 전역 검색 + 페이징
    Page<Engineer> findDistinctByCustomerIdAndUser_NameContainingIgnoreCaseOrCustomerIdAndUser_EmailContainingIgnoreCaseOrCustomerIdAndUser_PhoneContainingIgnoreCase(
            Long customerId1, String kw1,
            Long customerId2, String kw2,
            Long customerId3, String kw3,
            Pageable pageable);

    // 키워드가 비어있을 때를 위한 기본 목록
    Page<Engineer> findAllBy(Pageable pageable);
    Page<Engineer> findByCustomerId(Long customerId, Pageable pageable);
}
