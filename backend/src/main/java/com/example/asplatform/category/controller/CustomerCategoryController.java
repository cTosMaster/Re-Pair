package com.example.asplatform.category.controller;

import com.example.asplatform.category.dto.requestDTO.CustomerCategoryRequest;
import com.example.asplatform.category.dto.responseDTO.CustomerCategoryResponse;
import com.example.asplatform.category.service.CustomerCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/customer-categories")
public class CustomerCategoryController {

    private final CustomerCategoryService customerCategoryService;

    // 고객사 카테고리 등록
    @PostMapping("/{customerId}")
    public ResponseEntity<Void> addCategory(@PathVariable Long customerId,
                                            @RequestBody CustomerCategoryRequest dto) {
        customerCategoryService.addCustomerCategory(customerId, dto);
        return ResponseEntity.ok().build();
    }

    // 고객사 카테고리 목록 조회
    @GetMapping("/{customerId}")
    public ResponseEntity<List<CustomerCategoryResponse>> getCategories(@PathVariable Long customerId) {
        return ResponseEntity.ok(customerCategoryService.getCustomerCategories(customerId));
    }
}
