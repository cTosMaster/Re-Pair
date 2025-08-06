package com.example.asplatform.payment.controller;

import com.example.asplatform.payment.dto.requestDTO.PaymentRequestDto;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    @GetMapping("/payment-test")
    public String paymentTest(Model model) {
        // 빈 DTO 객체를 넣어줘야 th:object에서 바인딩할 대상이 됨
        model.addAttribute("paymentRequestDto", new PaymentRequestDto());
        return "payment-test";  // templates/payment-test.html 렌더링
    }
}
