package com.example.asplatform.customer.repository;

import com.example.asplatform.customer.domain.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByCompanyName(String keyword);
    // Optional<Customer> findByUser_Id(Long userId);
}
