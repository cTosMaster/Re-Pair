package com.example.asplatform.customer.controller;

import com.example.asplatform.customer.dto.responseDTO.CustomerResponse;
import com.example.asplatform.customer.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    // 전채 고객사 목록 조회
    @GetMapping
    public ResponseEntity<List<CustomerResponse>> getAllCustomers() {
        List<CustomerResponse> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }

    // 고객사 키워드 조회
    @GetMapping("/search")
    public ResponseEntity<List<CustomerResponse>> searchCustomers(@RequestParam String keyword) {
        List<CustomerResponse> customers = customerService.searchCustomers(keyword);
        return ResponseEntity.ok(customers);
    }

    // 한 고객사 상세 조회
    @GetMapping("/{customerId}")
    public ResponseEntity<CustomerResponse> getCustomerDetail(@PathVariable Long customerId) {
        CustomerResponse customer = customerService.getCustomerDetail(customerId);
        return ResponseEntity.ok(customer);
    }
}
