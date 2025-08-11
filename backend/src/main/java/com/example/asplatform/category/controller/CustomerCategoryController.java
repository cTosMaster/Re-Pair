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

    // 카테고리 생성
    @PostMapping("/{customerId}")
    public ResponseEntity<Void> createCategory( @PathVariable Long customerId, @RequestBody CustomerCategoryRequest request) {
        customerCategoryService.addCustomerCategory(customerId, request);
        return ResponseEntity.ok().build(); // 200 OK 응답
    }
    // 고객사 모든 카테고리 조회
    @GetMapping("/{customerId}")
    public List<CustomerCategoryResponse> getCategories(@PathVariable Long customerId) {
        return customerCategoryService.getCustomerCategories(customerId);
    }

    //카테고리 이름 수정
    @PatchMapping("/{categoryId}")
    public ResponseEntity<Void> updateCategory(
            @PathVariable Long categoryId,
            @RequestBody CustomerCategoryRequest request
    ) {
        customerCategoryService.updateCategory(categoryId, request);
        return ResponseEntity.ok().build();
    }

    // 카테고리 삭제
    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long categoryId) {
        customerCategoryService.deleteCategory(categoryId);
        return ResponseEntity.ok().build();
    }
}
