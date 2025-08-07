package com.example.asplatform.payment.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
import com.example.asplatform.payment.dto.responseDTO.WebhookEventDto;
import com.example.asplatform.payment.service.PaymentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

	 private final PaymentService paymentService;
	 
	    /**
	     * ✅ 인증된 사용자 이메일 추출 유틸
	     */
	    private String getCurrentUserEmail(UserDetails userDetails) {
	        if (userDetails == null) {
	            throw new RuntimeException("로그인이 필요한 서비스입니다.");
	        }
	        return userDetails.getUsername();
	    }

	    @PostMapping("/payments/webhook")
	    public ResponseEntity<?> handleWebhook(@RequestBody(required = false) WebhookEventDto dto) {
	        if (dto == null || dto.getEventType() == null || dto.getData() == null) {
	            System.err.println("⚠️ [Webhook] 잘못된 콜백 형식 또는 빈 요청이 들어왔습니다.");
	            return ResponseEntity.ok().build(); // 응답은 항상 200으로
	        }

	        System.out.println("📦 Toss 콜백 수신 원본 JSON = " + dto);

	        if ("PAYMENT_STATUS_CHANGED".equals(dto.getEventType())) {
	            // 🔧 서비스 레이어에서 처리하도록 위임
	            paymentService.updatePaymentStatus(dto.getData());
	        } else {
	            System.out.println("📭 처리되지 않은 이벤트 타입: " + dto.getEventType());
	        }

	        return ResponseEntity.ok().build();
	    }

	    
	    

	    
	    /**
	     * ✅ 1. 결제 요청 (가상계좌 발급)
	     */
	    @PostMapping("/request")
	    public ResponseEntity<PaymentResponseDto> requestPayment(@RequestBody PaymentRequestDto dto, @AuthenticationPrincipal UserDetails userDetails) {
	    	String username = userDetails.getUsername();
	    	return ResponseEntity.ok(paymentService.requestVirtualAccount(dto, username));
	    }

	    /**
	     * ✅ 2. Toss 콜백 수신
	     */
	    @PostMapping("/callback")
	    public ResponseEntity<String> handleCallback(@RequestBody WebhookEventDto webhookDto) {
	        System.out.println("📦 Toss 콜백 수신 원본 JSON = " + webhookDto);

	        if ("PAYMENT_STATUS_CHANGED".equals(webhookDto.getEventType())) {
	            paymentService.updatePaymentStatus(webhookDto.getData());
	        }

	        return ResponseEntity.ok("success");
	    }
	    
	    
	    
	    /**
	     * ✅ 3. 주문번호로 상태 조회 (기존)
	     */
	    @GetMapping("/status/{orderId}")
	    public ResponseEntity<PaymentResponseDto> getPaymentStatusByOrderId(@PathVariable String orderId,  @AuthenticationPrincipal UserDetails userDetails) {
	    	getCurrentUserEmail(userDetails);
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
	    public ResponseEntity<List<PaymentResponseDto>> getAllPayments(@AuthenticationPrincipal UserDetails userDetails) {
	        return ResponseEntity.ok(paymentService.getAllPayments());
	    }

	    /**
	     * ✅ 5. 결제 대기 목록 조회
	     */
	    @GetMapping("/pending")
	    public ResponseEntity<List<PaymentResponseDto>> getPendingPayments(@AuthenticationPrincipal UserDetails userDetails) {
	        return ResponseEntity.ok(paymentService.getPaymentsByStatus(PaymentStatus.READY));
	    }

	    /**
	     * ✅ 6. 결제 ID로 상태 조회
	     */
	    @GetMapping("/status/id/{repairId}")
	    public ResponseEntity<PaymentResponseDto> getPaymentStatusById(@PathVariable Long repairId,  @AuthenticationPrincipal UserDetails userDetails) {
	    	getCurrentUserEmail(userDetails);
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
	    public ResponseEntity<Payments> getPaymentDetail(@PathVariable Long repairId,  @AuthenticationPrincipal UserDetails userDetails) {
	    	getCurrentUserEmail(userDetails);
	    	return ResponseEntity.ok(paymentService.getPaymentById(repairId));
	    }
}
