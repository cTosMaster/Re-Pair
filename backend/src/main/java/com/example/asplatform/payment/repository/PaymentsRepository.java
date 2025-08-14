package com.example.asplatform.payment.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.asplatform.common.enums.PaymentStatus;
import com.example.asplatform.payment.domain.Payments;

@Repository
public interface PaymentsRepository extends JpaRepository<Payments, Long> {
    // 주문 아이디로 조회하기
	Optional<Payments> findByOrderId(String orderId);

    // 고객사 id로 조회하기 
    Page<Payments> findByCustomerId(Long customerId, Pageable pageable);
    
    // 고객사 id + 상태로 조회하기
    Page<Payments> findByCustomerIdAndStatus(Long customerId , PaymentStatus status, Pageable pageable);

    // payment id + 고객사 아이디로 조회
    Optional<Payments> findByPaymentIdAndCustomerId(Long paymentId, Long cusotmerId);
}