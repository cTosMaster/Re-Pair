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
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
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

    @Transactional
    public void deleteItem(Long itemId) {
        try {
            // 존재하지 않으면 EmptyResultDataAccessException 발생
            repairableItemRepository.deleteById(itemId);
            // FK 제약 위반을 즉시 감지(트랜잭션 종료까지 미루지 않도록)
            repairableItemRepository.flush();
        } catch (EmptyResultDataAccessException e) {
            // id 없음 → 404
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "해당 수리 항목이 존재하지 않습니다. id=" + itemId, e);
        } catch (DataIntegrityViolationException e) {
            // 참조 중 → 409
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "해당 수리용품은 다른 데이터에서 사용 중이라 삭제할 수 없습니다.", e);
        }
    }

    // 전체 수리물품 조회
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
