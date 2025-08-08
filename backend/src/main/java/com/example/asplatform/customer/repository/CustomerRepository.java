// src/main/java/com/example/asplatform/customer/repository/CustomerRepository.java
package com.example.asplatform.customer.repository;

import com.example.asplatform.customer.domain.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
}
