package com.example.asplatform.payment.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.asplatform.payment.domain.PaymentStatus;
import com.example.asplatform.payment.domain.Payments;

@Repository
public interface PaymentsRepository extends JpaRepository<Payments, Long> {
    Optional<Payments> findByOrderId(String orderId);
    List<Payments> findByStatus(PaymentStatus status);
}
