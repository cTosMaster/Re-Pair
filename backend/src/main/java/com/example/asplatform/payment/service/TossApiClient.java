package com.example.asplatform.payment.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.example.asplatform.payment.dto.requestDTO.PaymentRequestDto;
import com.example.asplatform.payment.dto.responseDTO.TossResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Toss Payments API 호출용 Client 클래스
 * - 가상계좌 발급, 결제 조회 등 Toss REST API 호출 담당
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TossApiClient {

	/**
	 * ✅ application.yml에서 값 주입하기
	 */
    @Value("${payment.toss.secret-key}")
    private String secretKey;

    @Value("${payment.toss.api-url}")
    private String tossApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    
    
    /**
     * ✅ Toss Payments API - 가상계좌 발급 요청
     * @param dto : 프론트에서 전달 받은 결제 정보
     * @param orderId : 서버에서 생성한 주문번호
     * @return TossResponse : 가상계좌 정보
     */
    public TossResponse requestVirtualAccount(PaymentRequestDto dto, String orderId) {
        // 1. 요청 URL ( Toss API Url 세팅 )
        String url = tossApiUrl + "/virtual-accounts";

        // 2. 요청 헤더
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Basic " + encodeSecretKey(secretKey));

        // 3. 요청 Body
        Map<String, Object> body = new HashMap<>();
        body.put("amount", dto.getAmount()); 
        body.put("orderId", orderId);

        body.put("orderName", dto.getOrderName());
        body.put("customerName", dto.getCustomerName());
        body.put("bank", dto.getBankCode());  // dto.getBankCode() -> bank로 변환
        body.put("dueDate", toOffsetDateTime(dto.getDueDate())); 
        
    
        if (dto.getCustomerEmail() != null) {
            body.put("customerEmail", dto.getCustomerEmail());
        }

        // successUrl, failUrl
        body.put("successUrl", "https://example.com/success");
        body.put("failUrl", "https://example.com/fail");

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        // 4. Toss API 호출
        ResponseEntity<String> responseEntity = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                String.class
        );

       
        String responseBody = responseEntity.getBody();
        System.out.println("Toss API 원본 응답 JSON = " + responseBody);

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        try {
            TossResponse tossResponse = objectMapper.readValue(responseBody, TossResponse.class);
            // Toss가 실패 응답일 경우
            if (tossResponse.getCode() != null) {
                throw new RuntimeException("Toss API 실패 응답: " + tossResponse.getMessage());
            }

            // 계좌 정보가 없는 경우
            if (tossResponse.getVirtualAccount() == null) {
                throw new RuntimeException("Toss API 응답에 계좌 정보가 없습니다.");
            }
            return tossResponse;
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON 파싱 실패: " + e.getMessage(), e);
        }

       
      
       
    }
    
    private String toOffsetDateTime(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        
        LocalDate localDate = LocalDate.parse(dateStr); // 예: "2025-08-15"
        OffsetDateTime offsetDateTime = OffsetDateTime.of(localDate, LocalTime.MAX, ZoneId.of("Asia/Seoul").getRules().getOffset(localDate.atStartOfDay()));
        
        return offsetDateTime.toString(); // → "2025-08-15T23:59:59+09:00"
    }

    /**
     * ✅ Toss Secret Key를 Base64 인코딩 (Basic Auth 용도)
     * @param key : toss secret key
     * @return base64 인코딩 문자열
     */
    private String encodeSecretKey(String key) {
        String credentials = key + ":";
        return Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
    }
    
    /**
     * ✅ secret-key 로그 찍히는지 확인하기
     */
    @PostConstruct
    public void init() {
    	System.out.println("✅ Toss Secret Key = " + secretKey);
    	System.out.println("✅ Toss API URL = "+ tossApiUrl);
    	System.out.println("✅ Toss Authorization Header = " + "Basic " + encodeSecretKey(secretKey));
    }
    
    /**
     * ✅ verify api 연결을 위한 메소드 ( PaymentService에서 콜백 부분)
     */
    public TossResponse verifyPayment(String paymentKey) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Basic " + encodeSecretKey(secretKey));

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            String url = tossApiUrl + "/payments/" + paymentKey; // ✅ 경로 중요

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                ObjectMapper objectMapper = new ObjectMapper();
                objectMapper.registerModule(new JavaTimeModule());
                objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

                return objectMapper.readValue(response.getBody(), TossResponse.class);
            } else {
                System.err.println("❗️[verifyPayment] Toss 응답 실패: " + response.getStatusCode());
            }
        } catch (Exception e) {
            System.err.println("❗️[verifyPayment 예외]: " + e.getMessage());
            e.printStackTrace();
        }

        return null;
    }

}