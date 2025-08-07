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

    public void createItem(RepairItemRequest dto) {
        RepairItem item = RepairItem.builder()
                .customerId(dto.getCustomerId())
                .categoryId(dto.getCategoryId()) // 👉 customer_categories.category_id
                .name(dto.getName())
                .price(dto.getPrice())
                .createdAt(LocalDateTime.now())
                .build();
        repairItemRepository.save(item);
    }

    public List<RepairItemResponse> getAllItems(Long customerId) {
        return repairItemRepository.findByCustomerId(customerId).stream()
                .map(RepairItemResponse::from)
                .collect(Collectors.toList());
    }

    public void deleteItem(Long id) {
        repairItemRepository.deleteById(id);
    }
}
