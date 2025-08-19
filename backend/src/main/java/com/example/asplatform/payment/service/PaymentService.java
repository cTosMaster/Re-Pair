package com.example.asplatform.payment.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.asplatform.auth.service.CustomUserDetails;
import com.example.asplatform.common.enums.PaymentStatus;
import com.example.asplatform.common.enums.RepairStatus;
import com.example.asplatform.payment.domain.Payments;
import com.example.asplatform.payment.dto.requestDTO.PaymentRequestDto;
import com.example.asplatform.payment.dto.responseDTO.PaymentResponseDto;
import com.example.asplatform.payment.dto.responseDTO.TossCallbackDto;
import com.example.asplatform.payment.dto.responseDTO.TossResponse;
import com.example.asplatform.payment.dto.responseDTO.WebhookEventData;
import com.example.asplatform.payment.repository.PaymentsRepository;
import com.example.asplatform.preset.domain.Preset;
import com.example.asplatform.repair.domain.Repair;
import com.example.asplatform.repair.repository.RepairRepository;
import com.example.asplatform.repairHistory.domain.RepairHistory;
import com.example.asplatform.repairHistory.repository.RepairHistoryRepository;
import com.example.asplatform.repairRequest.domain.RepairRequest;
import com.example.asplatform.repairRequest.repository.RepairRequestRepository;
import com.example.asplatform.user.domain.User;
import com.example.asplatform.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentsRepository paymentRepository;
    private final TossApiClient tossApiClient;
    private final RepairRequestRepository repairRequestRepository;
    private final RepairHistoryRepository repairHistoryRepository;
    private final RepairRepository repairRepository;
    private final UserRepository userRepository;

    
    /**
     * ✅ 1. 가상계좌 발급 하기 + payments 테이블 저장하기
     * @param dto
     * @return
     */
    @Transactional
    public PaymentResponseDto requestVirtualAccount(PaymentRequestDto dto, String username) {
    	
    	 // 1️⃣ 필수 DTO 값 체크
        if (dto.getRepairId() == null)
            throw new IllegalArgumentException("repairId가 필요합니다.");
        
        // 2️⃣ Repair + RepairRequest + User 조회
        Repair repair = repairRepository.findById(dto.getRepairId())
                .orElseThrow(() -> new IllegalArgumentException("해당 수리가 존재하지 않습니다."));
        
        RepairRequest request = repair.getRequest();
        
        // user 최소 정보 추출하기 (id , 이름 , 이메일 ) 
        Long customerId = request.getRepairableItem().getCustomer().getId();
        String customerName = request.getUser().getName();   
        String customerEmail = request.getUser().getEmail();  


        // 3️⃣ amount / orderName 세팅
        int amount = repair.getFinalPrice();
        String orderName = request.getTitle(); 
        
        // 4️⃣ Toss DTO 세팅
        dto.setAmount(amount);             
        dto.setOrderName(orderName);            
        dto.setCustomerName(customerName);            
        dto.setCustomerEmail(customerEmail);          
        dto.setCustomerId(customerId);  
        
        
        // 5️⃣ Toss API 호출
        String orderId = generateOrderId();
        TossResponse tossResponse = tossApiClient.requestVirtualAccount(dto, orderId);
        dto.setOrderId(orderId);
        if (tossResponse == null || tossResponse.getVirtualAccount() == null) {
            throw new IllegalStateException("Toss API 호출 실패: 가상계좌 정보가 없습니다.");
        }
        
        
        OffsetDateTime expiredAt = tossResponse.getVirtualAccount().getDueDate();
        LocalDateTime localExpiredAt = (expiredAt != null) ? expiredAt.toLocalDateTime() : null;
        
        //🔴 db 저장하기
        Payments payment = Payments.builder()
        		.requestId(request.getRequestId())
        		.repairId(dto.getRepairId())    		
                .customerId(customerId)
                .orderId(orderId)
                .orderName(orderName)
                .amount(amount)
                .status(PaymentStatus.READY)
                .customerName(customerName)
                .customerEmail(customerEmail)             
                .bankCode(dto.getBankCode())     
                .virtualAccountNumber(tossResponse.getVirtualAccount().getAccountNumber())
                .virtualAccountExpiredAt(localExpiredAt)
                .requestedAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .successUrl(dto.getSuccessUrl())               
                .failUrl(dto.getFailUrl()) 
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
    @Transactional
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

                // 결제 완료 시 RepairRequest 상태 변경하기
                updateRepairStatusAfterPayment(payment);
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
     * ✅ 4. 전체 결제 내역 조회하기 (자신의 고객사 결제 내역만 볼 수 있음 )
     * @return
     */
    public Page<PaymentResponseDto> getAllPayments(int page) {
        Long customerId = getCurrentCustomerId();
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), 10);

        Page<Payments> paymentsPage = paymentRepository.findByCustomerId(customerId, pageable);
        return paymentsPage.map(this::toResponseDto);
    }
    
    /**
     * ✅ 5. 상태별 결제 목록 조회하기 (READY) - 자신의 고객사 결제 내역만 볼 수 있음 
     * @param status
     * @return
     */
    public Page<PaymentResponseDto> getPaymentsByStatus(PaymentStatus status , int page) {
        Long customerId = getCurrentCustomerId();
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), 10);
	    
        Page<Payments> paymentsPage = paymentRepository.findByCustomerIdAndStatus(customerId, status, pageable);
        return paymentsPage.map(this::toResponseDto);
    }
    
    /**
     * ✅ 6. 결제 ID로 상세 조회하기 
     * @param requestId
     * @return
     */
    public Payments getPaymentById(Long requestId) {
    	Long currentCustomerId = getCurrentCustomerId();
        return paymentRepository.findByPaymentIdAndCustomerId(requestId, currentCustomerId)
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
    
    @Transactional
    private void updateRepairStatusAfterPayment(Payments payment) {
        Long repairId = payment.getRepairId();
        System.out.println("💡 Payment 저장 시 repairId=" + repairId);
        if (repairId == null) {
            System.out.println("❌ repairId 없음");
            return;
        }

        // 1️⃣ Repair 조회
        Repair repair = repairRepository.findById(repairId)
                .orElseThrow(() -> new IllegalArgumentException("해당 수리가 존재하지 않습니다."));

        // 2️⃣ RepairRequest 가져오기
        RepairRequest repairRequest = repair.getRequest();
        if (repairRequest == null) {
            throw new IllegalStateException("해당 Repair에 연결된 RepairRequest가 없습니다.");
        }

        RepairStatus previousStatus = repairRequest.getStatus();
        System.out.println("현재 RepairRequest 상태: " + previousStatus);

        // 3️⃣ 상태 변경 조건 확인
        if (!RepairStatus.WAITING_FOR_PAYMENT.equals(previousStatus)) {
            System.out.println("⚠️ 상태 변경 조건 미충족, 현재 상태: " + previousStatus);
            return;
        }

        // 4️⃣ 상태 업데이트
        repairRequest.setStatus(RepairStatus.WAITING_FOR_DELIVERY);
        repairRequestRepository.save(repairRequest);
        
        System.out.println("✅ RepairRequest 상태 변경됨 → WAITING_FOR_DELIVERY");

        // 5️⃣ 시스템 유저 (ex. 1번) 조회
        User systemUser = userRepository.findById(1L)
                .orElseThrow(() -> new IllegalStateException("시스템 유저가 존재하지 않습니다."));

        // 6️⃣ RepairHistory 기록 남기기
        RepairHistory history = RepairHistory.builder()
                .repairRequest(repairRequest)
                .previousStatus(previousStatus)
                .newStatus(RepairStatus.WAITING_FOR_DELIVERY)
                .changedBy(systemUser)
                .memo("결제 완료로 상태 변경")
                .build();

        repairHistoryRepository.save(history);

        System.out.println("✅ 상태 변경 + 히스토리 기록 완료");
    }


    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails.getUser(); // CustomUserDetails에 User 엔티티 반환 메서드 필요
        }
        throw new IllegalStateException("로그인된 사용자 정보를 가져올 수 없습니다.");
    }
    
    private Long getCurrentCustomerId() {
    	Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    	if(auth == null || !(auth.getPrincipal() instanceof CustomUserDetails userDetails)) {
    		throw new IllegalStateException("로그인된 사용자 정보를 가져올 수 없습니다.");
    	}
    	return userDetails.getCustomerId();
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
                updateRepairStatusAfterPayment(payment);
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