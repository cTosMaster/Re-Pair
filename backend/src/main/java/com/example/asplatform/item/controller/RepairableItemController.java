package com.example.asplatform.item.controller;

import com.example.asplatform.auth.service.CustomUserDetails;
import com.example.asplatform.customer.repository.CustomerRepository;
import com.example.asplatform.item.dto.requestDTO.RepairableItemRequest;
import com.example.asplatform.item.dto.responseDTO.RepairableItemResponse;
import com.example.asplatform.item.service.RepairableItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/repair-items")
@RequiredArgsConstructor
public class RepairableItemController {

    private final RepairableItemService repairItemService;
    private final RepairableItemService repairableItemService;

    @PostMapping
    public ResponseEntity<String> createItem(@RequestBody RepairableItemRequest request) {
        Long customerId = request.getCustomerId();
        repairableItemService.createItem(customerId, request);
        return ResponseEntity.ok("수리 항목이 등록되었습니다.");
    }

    // 수리물품 소프트 삭제
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        repairableItemService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }

    // 전체 항목 조회 (고객사 전용)
    @GetMapping
    public ResponseEntity<List<RepairableItemResponse>> getAllItems() {
        return ResponseEntity.ok(repairItemService.getAllItems());
    }

    // 고객사 ID 기준 조회
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<RepairableItemResponse>> getItemsByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(repairItemService.getItemsByCustomerId(customerId));
    }

    // 카테고리 ID 기준 조회
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<RepairableItemResponse>> getItemsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(repairItemService.getItemsByCategoryId(categoryId));
    }

    // 고객사 + 카테고리 기준 조회
    @GetMapping("/customer/{customerId}/category/{categoryId}")
    public ResponseEntity<List<RepairableItemResponse>> getItemsByCustomerAndCategory(
            @PathVariable Long customerId,
            @PathVariable Long categoryId) {
        return ResponseEntity.ok(repairItemService.getItemsByCustomerAndCategory(customerId, categoryId));
    }
}
