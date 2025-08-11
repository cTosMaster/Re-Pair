package com.example.asplatform.payment.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.asplatform.common.enums.PaymentStatus;
import com.example.asplatform.payment.domain.Payments;
import com.example.asplatform.payment.dto.requestDTO.PaymentRequestDto;
import com.example.asplatform.payment.dto.responseDTO.PaymentResponseDto;
import com.example.asplatform.payment.dto.responseDTO.TossCallbackDto;
import com.example.asplatform.payment.dto.responseDTO.TossResponse;
import com.example.asplatform.payment.dto.responseDTO.WebhookEventData;
import com.example.asplatform.payment.repository.PaymentsRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentsRepository paymentRepository;
    private final TossApiClient tossApiClient;

    
    /**
     * ✅ 1. 가상계좌 발급 하기 + payments 테이블 저장하기
     * @param dto
     * @return
     */
    public PaymentResponseDto requestVirtualAccount(PaymentRequestDto dto, String username) {
    	 // 유효성 검증
        if (dto.getAmount() == null || dto.getAmount() <= 0)
            throw new IllegalArgumentException("금액이 올바르지 않습니다.");
        if (dto.getBankCode() == null || dto.getBankCode().isEmpty())
            throw new IllegalArgumentException("은행 코드가 필요합니다.");
        
        
        String orderId = generateOrderId();

        // 🔴 toss api 로 가상계좌 발급 요청하기
        TossResponse tossResponse = tossApiClient.requestVirtualAccount(dto, orderId);

        
        if (tossResponse == null || tossResponse.getVirtualAccount() == null) {
            throw new IllegalStateException("Toss API 호출 실패: 가상계좌 정보가 없습니다.");
        }
        
        
        OffsetDateTime expiredAt = tossResponse.getVirtualAccount().getDueDate();
        LocalDateTime localExpiredAt = (expiredAt != null) ? expiredAt.toLocalDateTime() : null;
        
        //🔴 db 저장하기
        Payments payment = Payments.builder()
        		.repairId(dto.getRepairId())
                .customerId(dto.getCustomerId())
                .orderId(orderId)
                .orderName(dto.getOrderName())
                .amount(dto.getAmount())
                .status(PaymentStatus.READY)
                .customerName(tossResponse.getCustomerName())
                .virtualAccountNumber(tossResponse.getVirtualAccount().getAccountNumber())
                //.virtualAccountExpiredAt(tossResponse.getAccount().getExpiredAt().toLocalDateTime())
                .virtualAccountExpiredAt(localExpiredAt)
                .requestedAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .paymentKey(tossResponse.getPaymentKey()) 
                .method(tossResponse.getMethod())         
                .build();

        paymentRepository.save(payment);

        return toResponseDto(payment);
    }

    
    
    /**
     * ✅ 2. 결제 콜백 처리하기 + verify api 확인 추가하기
     * - Toss -> 서버로 보내는 입금 완료 알림
     * @param dto
     */
    public void processCallback(TossCallbackDto dto) {
      

    	System.out.println("콜백 상태: " + dto.getStatus());
    	
        if (dto.getOrderId() == null || dto.getStatus() == null) {
            System.err.println("❗️콜백 데이터 누락");
            return;
        }

        Optional<Payments> optionalPayment = paymentRepository.findByOrderId(dto.getOrderId());
        
        
        if (optionalPayment.isEmpty()) {
        	System.out.println("⚠️ 콜백으로 받은 orderId에 해당하는 결제가 DB에 없습니다. orderId: {}" + dto.getOrderId());
            return;
        }
     
        Payments payment = optionalPayment.get();
        String paymentKey = payment.getPaymentKey(); 
        
        

        // ✅ Toss 서버에 실제 상태 확인 (verify API 호출)
        TossResponse verifyResponse = tossApiClient.verifyPayment(payment.getPaymentKey());

        if (verifyResponse == null || verifyResponse.getStatus() == null) {
            System.err.println("❗️[콜백] Toss verify 응답 없음 or status 없음");
            return;
        }

        String verifiedStatus = verifyResponse.getStatus().toUpperCase(); 
        System.out.println("verify 상태: " + verifyResponse.getStatus());

        payment.setPaymentKey(verifyResponse.getPaymentKey());
        payment.setMethod(verifyResponse.getMethod());

        System.out.println("verifiedStatus: " + verifiedStatus);

        switch (verifiedStatus) {
        
	        case "WAITING_FOR_DEPOSIT" -> {
	            payment.setStatus(PaymentStatus.READY);  
	          
	        }
	        case "IN_PROGRESS" -> {
	            payment.setStatus(PaymentStatus.IN_PROGRESS);  
	        }
            case "DONE" -> {
                payment.setStatus(PaymentStatus.DONE);
                payment.setApprovedAt(LocalDateTime.now());
            }
            case "CANCELED" -> {
            	 System.out.println("취소 상태 처리중");
                payment.setStatus(PaymentStatus.CANCELED);
                payment.setCanceledAt(LocalDateTime.now());
            }
            case "FAILED" -> {
                payment.setStatus(PaymentStatus.FAILED);
            }
            default -> {
                System.err.println("❗️[콜백] 처리되지 않은 상태 값: " + verifiedStatus);
                return;
            }
        }

        paymentRepository.save(payment);
        System.out.println("✅ [DB 저장 완료] 상태: " + payment.getStatus());
    }
    
    /**
     * ✅ 3. 주문번호로 조회하기
     * @param orderId
     * @return
     */
    public Optional<Payments> getPaymentByOrderId(String orderId) {
        return paymentRepository.findByOrderId(orderId);
    }
    
    
    
    /**
     * ✅ 4. 전체 결제 내역 조회하기
     * @return
     */
    public List<PaymentResponseDto> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::toResponseDto)
                .toList();
    }
    
    /**
     * ✅ 5. 상태별 결제 목록 조회하기 (READY)
     * @param status
     * @return
     */
    public List<PaymentResponseDto> getPaymentsByStatus(PaymentStatus status) {
        return paymentRepository.findByStatus(status).stream()
                .map(this::toResponseDto)
                .toList();
    }
    
    /**
     * ✅ 6. 결제 ID로 상세 조회하기
     * @param requestId
     * @return
     */
    public Payments getPaymentById(Long requestId) {
        return paymentRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("결제 요청이 존재하지 않습니다."));
    }
    

    
    /**
     * 주문 아이디 생성하기
     * @return
     */
    private String generateOrderId () {
        return "ORD" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) 
               + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    
    /**
     * 공통 응답 변환하기
     * @param payment
     * @return
     */
    private PaymentResponseDto toResponseDto(Payments payment) {
        return new PaymentResponseDto(
                payment.getOrderId(),
                payment.getVirtualAccountNumber(),
                payment.getVirtualAccountExpiredAt(),
                payment.getAmount(),
                payment.getStatus()
        );
    }
    
    public void updatePaymentStatus(WebhookEventData data) {
        String orderId = data.getOrderId();

        Payments payment = paymentRepository.findByOrderId(orderId)
            .orElseThrow(() -> new IllegalArgumentException("해당 결제 건이 존재하지 않습니다: " + orderId));

   
        String paymentKey = payment.getPaymentKey();

        // ✅ Toss API 에 실제로 verify 호출하기
        TossResponse verifyResponse = tossApiClient.verifyPayment(paymentKey);

        if (verifyResponse == null || verifyResponse.getStatus() == null) {
            System.err.println("❗️[verify] Toss 응답 없음 또는 상태 누락");
            return;
        }

        String verifiedStatus = verifyResponse.getStatus().toUpperCase();

        switch (verifiedStatus) {
            case "WAITING_FOR_DEPOSIT" -> payment.setStatus(PaymentStatus.READY);
            case "IN_PROGRESS" -> payment.setStatus(PaymentStatus.IN_PROGRESS);
            case "DONE" -> {
                payment.setStatus(PaymentStatus.DONE);
                payment.setApprovedAt(LocalDateTime.now());
            }
            case "CANCELED" -> {
                payment.setStatus(PaymentStatus.CANCELED);
                payment.setCanceledAt(LocalDateTime.now());
            }
            case "FAILED" -> payment.setStatus(PaymentStatus.FAILED);
            default -> {
                System.out.println("🚨 Unknown verified status: " + verifiedStatus);
                return;
            }
        }

        paymentRepository.save(payment);
        System.out.println("✅ 결제 상태 업데이트 완료 (verify 기반): " + payment.getStatus());
    }
    
 


    
}