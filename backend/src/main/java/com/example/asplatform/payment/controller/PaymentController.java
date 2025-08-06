package com.example.asplatform.payment.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.asplatform.payment.domain.PaymentStatus;
import com.example.asplatform.payment.domain.Payments;
import com.example.asplatform.payment.dto.requestDTO.PaymentRequestDto;
import com.example.asplatform.payment.dto.responseDTO.PaymentResponseDto;
import com.example.asplatform.payment.dto.responseDTO.TossCallbackDto;
import com.example.asplatform.payment.service.PaymentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

	 private final PaymentService paymentService;

	    /**
	     * ✅ 1. 결제 요청 (가상계좌 발급)
	     */
	    @PostMapping("/request")
	    public ResponseEntity<PaymentResponseDto> requestPayment(@RequestBody PaymentRequestDto dto) {
	        return ResponseEntity.ok(paymentService.requestVirtualAccount(dto));
	    }

	    /**
	     * ✅ 2. Toss 콜백 수신
	     */
	    @PostMapping("/callback")
	    public ResponseEntity<String> handleCallback(@RequestBody String rawJson) {
	        System.out.println("📦 Toss 콜백 수신 원본 JSON = " + rawJson);
	        return ResponseEntity.ok("success");
	    }
	    
	    
	    
	    /**
	     * ✅ 3. 주문번호로 상태 조회 (기존)
	     */
	    @GetMapping("/status/{orderId}")
	    public ResponseEntity<PaymentResponseDto> getPaymentStatusByOrderId(@PathVariable String orderId) {
	        Payments payment = paymentService.getPaymentByOrderId(orderId)
	                .orElseThrow(() -> new IllegalArgumentException("주문 정보를 찾을 수 없습니다."));
	        return ResponseEntity.ok(new PaymentResponseDto(
	                payment.getOrderId(),
	                payment.getVirtualAccountNumber(),
	                payment.getVirtualAccountExpiredAt(),
	                payment.getAmount(),
	                payment.getStatus()
	        ));
	    }

	    /**
	     * ✅ 4. 결제 내역 전체 조회
	     */
	    @GetMapping("")
	    public ResponseEntity<List<PaymentResponseDto>> getAllPayments() {
	        return ResponseEntity.ok(paymentService.getAllPayments());
	    }

	    /**
	     * ✅ 5. 결제 대기 목록 조회
	     */
	    @GetMapping("/pending")
	    public ResponseEntity<List<PaymentResponseDto>> getPendingPayments() {
	        return ResponseEntity.ok(paymentService.getPaymentsByStatus(PaymentStatus.READY));
	    }

	    /**
	     * ✅ 6. 결제 ID로 상태 조회
	     */
	    @GetMapping("/status/id/{repairId}")
	    public ResponseEntity<PaymentResponseDto> getPaymentStatusById(@PathVariable Long repairId) {
	        Payments payment = paymentService.getPaymentById(repairId);
	        return ResponseEntity.ok(new PaymentResponseDto(
	                payment.getOrderId(),
	                payment.getVirtualAccountNumber(),
	                payment.getVirtualAccountExpiredAt(),
	                payment.getAmount(),
	                payment.getStatus()
	        ));
	    }

	    /**
	     * ✅ 7. 결제 ID로 상세 내역 조회
	     */
	    @GetMapping("/detail/{repairId}")
	    public ResponseEntity<Payments> getPaymentDetail(@PathVariable Long repairId) {
	        return ResponseEntity.ok(paymentService.getPaymentById(repairId));
	    }
}
