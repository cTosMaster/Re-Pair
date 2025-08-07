package com.example.asplatform.item.controller;

import com.example.asplatform.item.dto.requestDTO.RepairItemRequest;
import com.example.asplatform.item.dto.responseDTO.RepairItemResponse;
import com.example.asplatform.item.service.RepairItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/repair-items")
public class RepairItemController {

    private final RepairItemService repairItemService;

    /**
     * 수리 항목 등록 (고객사에서 자체 카테고리 기준으로 등록)
     * @param dto RepairItemRequest
     * @return 200 OK
     */
    @PostMapping
    public ResponseEntity<Void> createItem(@RequestBody RepairItemRequest dto) {
        repairItemService.createItem(dto);
        return ResponseEntity.ok().build();
    }

    /**
     * 전체 수리 항목 조회 (모든 고객사의 수리 항목을 조회)
     *
     * @return 200 OK + List<RepairItemResponse>
     */
    @GetMapping
    public ResponseEntity<List<RepairItemResponse>> getAllItems() {
        return ResponseEntity.ok(repairItemService.getAllItems());
    }

    /**
     * 특정 고객사의 수리 항목 조회
     *
     * @param customerId 고객사 ID
     * @return 200 OK + List<RepairItemResponse>
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<RepairItemResponse>> getItemsByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(repairItemService.getAllItemsByCustomer(customerId));
    }

    /**
     * 수리 항목 삭제
     * @param id 수리 항목 ID
     * @return 204 No Content
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        repairItemService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}
