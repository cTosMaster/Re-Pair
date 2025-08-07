package com.example.asplatform.item.service;

import com.example.asplatform.item.domain.RepairItem;
import com.example.asplatform.item.dto.requestDTO.RepairItemRequest;
import com.example.asplatform.item.dto.responseDTO.RepairItemResponse;
import com.example.asplatform.item.repository.RepairItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RepairItemService {

    private final RepairItemRepository repairItemRepository;

    // 수리 물품 생성
    public void createItem(RepairItemRequest dto) {
        RepairItem item = RepairItem.builder()
                .customerId(dto.getCustomerId())
                .categoryId(dto.getCategoryId()) //  customer_categories.category_id
                .name(dto.getName())
                .price(dto.getPrice())
                .createdAt(LocalDateTime.now())
                .build();
        repairItemRepository.save(item);
    }

    // 전체 수리 항목 조회
    public List<RepairItemResponse> getAllItems() {
        return repairItemRepository.findAll().stream()
                .map(RepairItemResponse::from)
                .collect(Collectors.toList());
    }

    // 특정 고객사의 수리 항목 조회
    public List<RepairItemResponse> getAllItemsByCustomer(Long customerId) {
        return repairItemRepository.findByCustomerId(customerId).stream()
                .map(RepairItemResponse::from)
                .collect(Collectors.toList());
    }

    // 삭제
    public void deleteItem(Long id) {
        repairItemRepository.deleteById(id);
    }
}
