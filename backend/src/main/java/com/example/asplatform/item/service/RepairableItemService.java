package com.example.asplatform.item.service;

import com.example.asplatform.category.domain.CustomerCategory;
import com.example.asplatform.category.repository.CustomerCategoryRepository;
import com.example.asplatform.customer.domain.Customer;
import com.example.asplatform.customer.repository.CustomerRepository;
import com.example.asplatform.item.domain.RepairableItem;
import com.example.asplatform.item.dto.requestDTO.RepairableItemRequest;
import com.example.asplatform.item.dto.requestDTO.RepairableItemUpdateRequest;
import com.example.asplatform.item.dto.responseDTO.RepairableItemResponse;
import com.example.asplatform.item.repository.RepairableItemRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class RepairableItemService {

    private final RepairableItemRepository repairableItemRepository;
    private final CustomerCategoryRepository customerCategoryRepository;

    // 🔹 수리 항목 등록
    public void createItem(Long customerId, RepairableItemRequest request) {
        RepairableItem item = RepairableItem.builder()
                .customer(Customer.builder().id(customerId).build())
                .category(CustomerCategory.builder().id(request.getCategoryId()).build())
                .name(request.getName())
                .price(request.getPrice())
                .build();

        repairableItemRepository.save(item);
    }

    // 🔹 수리 항목 수정
    public void updateItem(Long itemId, RepairableItemUpdateRequest request) {
        RepairableItem item = repairableItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("수리 항목이 존재하지 않습니다."));

        CustomerCategory category = customerCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));

        item.update(category, request.getName(), request.getPrice());
    }

    // soft delete
    @Transactional
    public void deleteItem(Long itemId) {
        Boolean deleted = repairableItemRepository.selectIsDeleted(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 항목입니다. id=" + itemId));

        if (Boolean.TRUE.equals(deleted)) {
            log.warn("삭제 거부: 이미 소프트 삭제된 항목 itemId={}", itemId); // ← 콘솔/로그
            throw new ResponseStatusException(HttpStatus.GONE, "이미 삭제된 항목입니다.");
        }

        // 살아있는 경우에만 soft delete (@SQLDelete가 is_deleted=true로 업데이트)
        repairableItemRepository.deleteById(itemId);
    }


    // 전체 수리물품 조회
    @Transactional(readOnly = true)
    public List<RepairableItemResponse> getAllItems() {
        return repairableItemRepository.findAll().stream()
                .map(RepairableItemResponse::from)
                .collect(Collectors.toList());
    }

    // 고객사 기준 조회
    @Transactional(readOnly = true) // LazyInitializationException 오류
    public List<RepairableItemResponse> getItemsByCustomerId(Long customerId) {
        return repairableItemRepository.findByCustomerId(customerId).stream()
                .map(RepairableItemResponse::from)
                .collect(Collectors.toList());
    }

    // 카테고리 기준 조회
    @Transactional(readOnly = true)
    public List<RepairableItemResponse> getItemsByCategoryId(Long categoryId) {
        return repairableItemRepository.findByCategoryId(categoryId).stream()
                .map(RepairableItemResponse::from)
                .collect(Collectors.toList());
    }

    // 고객사 + 카테고리 기준 조회
    @Transactional(readOnly = true)
    public List<RepairableItemResponse> getItemsByCustomerAndCategory(Long customerId, Long categoryId) {
        return repairableItemRepository.findByCustomerIdAndCategoryId(customerId, categoryId).stream()
                .map(RepairableItemResponse::from)
                .collect(Collectors.toList());
    }
}
