package com.example.asplatform.payment.domain;

import java.time.LocalDateTime;

import com.example.asplatform.common.enums.PaymentStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payments {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long paymentId;
	
	private Long repairId;
	private Long customerId;
	
    @Column(nullable = false, unique = true)
	private String orderId;
    
    private String orderName;
    private String paymentKey;
    private String method;
    private int amount;
    
    @Enumerated(EnumType.STRING)
    private PaymentStatus status;
    
    private LocalDateTime requestedAt = LocalDateTime.now();
    private LocalDateTime approvedAt;
    private LocalDateTime canceledAt;
    
    private String customerName;
    private String virtualAccountNumber;
    private LocalDateTime virtualAccountExpiredAt;
    
    @Column(updatable = false) 
    private LocalDateTime createdAt = LocalDateTime.now();
    
	

}