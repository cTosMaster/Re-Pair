package com.example.asplatform.engineer.repository;

import com.example.asplatform.engineer.domain.Engineer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;


public interface EngineerRepository extends JpaRepository<Engineer, Long> {
    Page<Engineer> findByCustomerId(Long customerId, Pageable pageable);
}
