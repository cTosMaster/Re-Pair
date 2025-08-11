package com.example.asplatform.customer.repository;

import com.example.asplatform.customer.domain.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    // 부분 일치 + 대소문자 무시 (회사명)
    Page<Customer> findByCompanyNameContainingIgnoreCase(String keyword, Pageable pageable);

}
