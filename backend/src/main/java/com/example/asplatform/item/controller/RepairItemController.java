package com.example.asplatform.item.controller;

import com.example.asplatform.item.dto.requestDTO.RepairItemRequestDto;
import com.example.asplatform.item.dto.requestDTO.RepairItemUpdateRequestDto;
import com.example.asplatform.item.dto.responseDTO.RepairItemResponseDto;
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

    @GetMapping
    public ResponseEntity<List<RepairItemResponseDto>> getAllItems() {
        List<RepairItemResponseDto> items = repairItemService.getAllItems();
        return ResponseEntity.ok(items);
    }

    @PostMapping
    public ResponseEntity<String> createItem(@RequestBody RepairItemRequestDto dto){
        repairItemService.createItem(dto);
        return ResponseEntity.ok("수리 물품이 등록되었습니다");
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<String> deleteItem(@PathVariable Long itemId) {
        repairItemService.deleteItem(itemId);
        return ResponseEntity.ok("수리물품이 삭제되었습니다.");
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<String> updateItem(@PathVariable Long itemId,
                                             @RequestBody RepairItemUpdateRequestDto dto) {
        repairItemService.updateItem(itemId, dto);
        return ResponseEntity.ok("수리 물품이 수정되었습니다.");
    }
}