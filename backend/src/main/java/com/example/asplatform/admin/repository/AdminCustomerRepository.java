// src/main/java/com/example/asplatform/admin/repository/AdminCustomerRepository.java
package com.example.asplatform.admin.repository;

import com.example.asplatform.customer.domain.Customer;
import com.example.asplatform.common.enums.CustomerStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminCustomerRepository extends JpaRepository<Customer, Long> {
    Page<Customer> findByStatus(CustomerStatus status, Pageable pageable);
}
