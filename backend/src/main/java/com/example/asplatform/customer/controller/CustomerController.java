package com.example.asplatform.customer.controller;

import com.example.asplatform.customer.dto.responseDTO.CustomerResponse;
import com.example.asplatform.customer.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
            @ParameterObject
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC, size = 20)
            Pageable pageable,
            @RequestParam(required = false) String keyword
    ) {
        // 선택: 정렬 화이트리스트(프론트가 잘못 보내도 안전)
        Pageable safe = sanitize(pageable, java.util.List.of("customerId","companyName","createdAt","status"));

        Page<CustomerResponse> page = (keyword == null || keyword.isBlank())
                ? customerService.getCustomers(safe)
                : customerService.searchCustomers(keyword, safe);
        return ResponseEntity.ok(page);
    }


    @GetMapping("/{customerId}")
    public ResponseEntity<CustomerResponse> getCustomerDetail(@PathVariable Long customerId) {
        return ResponseEntity.ok(customerService.getCustomerDetail(customerId));
    }
    private Pageable sanitize(Pageable in, java.util.List<String> allow) {
        var sort = in.getSort().isUnsorted()
                ? Sort.by(Sort.Order.desc("createdAt"))
                : Sort.by(in.getSort().stream()
                .filter(o -> allow.contains(o.getProperty()))
                .map(o -> o.isAscending() ? Sort.Order.asc(o.getProperty())
                        : Sort.Order.desc(o.getProperty()))
                .toList());
        int page = Math.max(0, in.getPageNumber());
        int size = in.getPageSize() > 0 ? in.getPageSize() : 20;
        return org.springframework.data.domain.PageRequest.of(page, size, sort);
    }
}
