package com.example.asplatform.item.service;

import com.example.asplatform.category.domain.Category;
import com.example.asplatform.category.repository.CategoryRepository;
import com.example.asplatform.customer.domain.Customer;
import com.example.asplatform.customer.repository.CustomerRepository;
import com.example.asplatform.item.domain.RepairItem;
import com.example.asplatform.item.dto.requestDTO.RepairItemRequestDto;
import com.example.asplatform.item.dto.requestDTO.RepairItemUpdateRequestDto;
import com.example.asplatform.item.dto.responseDTO.RepairItemResponseDto;
import com.example.asplatform.item.repository.RepairItemRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RepairItemService {

    private final RepairItemRepository repairItemRepository;
    private final CategoryRepository categoryRepository;
    private final CustomerRepository customerRepository;

    // 전체 수리 물품 조회 -> DTO 리스트로 변환
    public List<RepairItemResponseDto> getAllItems() {
        return repairItemRepository.findAll().stream()
                .map(RepairItemResponseDto::from)
                .collect(Collectors.toList());
    }

    // 수리 물품 등록
    public Long createItem(RepairItemRequestDto dto) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("카테고리를 찾을 수 없습니다."));
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new EntityNotFoundException("고객사를 찾을 수 없습니다."));

        RepairItem item = new RepairItem(category, customer, dto.getName(), dto.getPrice());
        repairItemRepository.save(item);
        return item.getId();
    }

    // 수리 물품 삭제
    public void deleteItem(Long itemId) {
        if (!repairItemRepository.existsById(itemId)) {
            throw new EntityNotFoundException("해당 수리 물품이 존재하지 않습니다.");
        }
        repairItemRepository.deleteById(itemId);
    }
    // src/main/java/com/example/asplatform/item/service/RepairItemService.java


    // RepairItem에 setName, setPrice, setCategory 등 Setter 확인
    @Transactional
    public void updateItem(Long itemId, RepairItemUpdateRequestDto dto) {
        RepairItem item = repairItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("수리 물품이 존재하지 않습니다."));

        if (dto.getName() != null) {
            item.setName(dto.getName());
        }

        if (dto.getPrice() != null) {
            item.setPrice(dto.getPrice());
        }

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new EntityNotFoundException("카테고리가 존재하지 않습니다."));
            item.setCategory(category);
        }
    }

}
