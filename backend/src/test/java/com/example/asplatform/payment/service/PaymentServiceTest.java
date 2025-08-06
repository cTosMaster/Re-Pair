package com.example.asplatform.payment.service;

import static org.junit.jupiter.api.Assertions.*;

import com.example.asplatform.payment.dto.requestDTO.PaymentRequestDto;
import com.example.asplatform.payment.dto.responseDTO.PaymentResponseDto;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class PaymentServiceTest {

    @Autowired
    private PaymentService paymentService;

    @Test
    public void testRequestVirtualAccount() {
        PaymentRequestDto dto = PaymentRequestDto.builder()
            .repairId(1L) // 실제 DB에 있는 repair_id 값 넣기
            .customerId(1L)
            .amount(55000)
            .orderName("아이폰12 액정 수리")
            .customerName("홍길동")
            .bankCode("088")  // 은행 코드 예시
            .dueDate("2025-08-15")
            .build();

        PaymentResponseDto response = paymentService.requestVirtualAccount(dto);
        System.out.println("response = " + response);

        assertNotNull(response);
        assertEquals(55000, response.getAmount());
    }
}
