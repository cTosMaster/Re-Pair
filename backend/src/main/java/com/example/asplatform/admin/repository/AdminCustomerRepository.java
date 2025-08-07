package com.example.asplatform.admin.repository;

import com.example.asplatform.customer.domain.Customer;
import com.example.asplatform.common.enums.CustomerStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminCustomerRepository extends JpaRepository<Customer, Long> {

    Page<Customer> findByStatus(CustomerStatus status, Pageable pageable);
}
