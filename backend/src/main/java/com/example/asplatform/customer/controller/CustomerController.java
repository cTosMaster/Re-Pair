package com.example.asplatform.customer.controller;

import com.example.asplatform.customer.dto.responseDTO.CustomerResponse;
import com.example.asplatform.customer.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    /** 전체 고객사 목록 조회 (페이징/정렬 지원) */
    @GetMapping
    public ResponseEntity<Page<CustomerResponse>> getCustomers(
            @PageableDefault(sort = "id") Pageable pageable,
            @RequestParam(required = false) String keyword   // 검색어가 있으면 검색, 없으면 전체
    ) {
        Page<CustomerResponse> page = (keyword == null || keyword.isBlank())
                ? customerService.getCustomers(pageable)
                : customerService.searchCustomers(keyword, pageable);
        return ResponseEntity.ok(page);
    }

    /** 고객사 상세 조회 */
    @GetMapping("/{customerId}")
    public ResponseEntity<CustomerResponse> getCustomerDetail(@PathVariable Long customerId) {
        return ResponseEntity.ok(customerService.getCustomerDetail(customerId));
    }
}
