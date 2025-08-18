package com.example.asplatform.category.controller;

import com.example.asplatform.auth.service.CustomUserDetails;
import com.example.asplatform.category.dto.requestDTO.CustomerCategoryRequest;
import com.example.asplatform.category.dto.responseDTO.CustomerCategoryResponse;
import com.example.asplatform.category.service.CustomerCategoryService;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/customers/{customerId}/categories")
public class CustomerCategoryController {

    private final CustomerCategoryService service;

    // 생성
    @PostMapping
    public ResponseEntity<Void> createCategory(
            @PathVariable Long customerId,
            @RequestBody CustomerCategoryRequest request
    ) {
        service.addCustomerCategory(customerId, request);
        return ResponseEntity.ok().build();
    }

    // 페이지 + 검색
    @GetMapping
    public ResponseEntity<Page<CustomerCategoryResponse>> list(
            @PathVariable Long customerId,
            @RequestParam(required = false) String keyword,
            @ParameterObject
            @PageableDefault(size = 20, sort = "name") Pageable pageable
    ) {
        return ResponseEntity.ok(service.getCustomerCategories(customerId, keyword, pageable));
    }

    // (옵션) 전체 리스트가 꼭 필요하면
    @GetMapping("/all")
    public List<CustomerCategoryResponse> listAll(@PathVariable Long customerId) {
        return service.getCustomerCategories(customerId);
    }

    // 수정
    @PatchMapping("/{categoryId}")
    public ResponseEntity<Void> updateCategory(
            @PathVariable Long categoryId,
            @RequestBody CustomerCategoryRequest request
    ) {
        service.updateCategory(categoryId, request);
        return ResponseEntity.ok().build();
    }

    // 삭제
    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> delete(@PathVariable Long categoryId) {
        service.deleteCategory(categoryId);
        return ResponseEntity.noContent().build();
    }
}
