package com.example.asplatform.engineer.repository;

import com.example.asplatform.engineer.domain.Engineer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EngineerRepository extends JpaRepository<Engineer, Long> {
    List<Engineer> findByCustomerCustomerId(Long customerId);
}
