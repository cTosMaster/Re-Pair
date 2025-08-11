package com.example.asplatform.category.service;

import com.example.asplatform.category.domain.CustomerCategory;
import com.example.asplatform.category.dto.requestDTO.CustomerCategoryRequest;
import com.example.asplatform.category.dto.responseDTO.CustomerCategoryResponse;
import com.example.asplatform.category.repository.CustomerCategoryRepository;
import com.example.asplatform.customer.domain.Customer;
import com.example.asplatform.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerCategoryService {

    private final CustomerCategoryRepository customerCategoryRepository;

    public void addCustomerCategory(Long customerId, CustomerCategoryRequest dto) {
        CustomerCategory category = CustomerCategory.builder()
                .customerId(customerId)
                .name(dto.getName())
                .build();
        customerCategoryRepository.save(category);
    }

    public List<CustomerCategoryResponse> getCustomerCategories(Long customerId) {
        return customerCategoryRepository.findByCustomerId(customerId).stream()
                .map(CustomerCategoryResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateCategory(Long categoryId, CustomerCategoryRequest request) {
        CustomerCategory category = customerCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));
        category.updateName(request.getName());
    }

    public void deleteCategory(Long categoryId) {
        customerCategoryRepository.deleteById(categoryId);
    }
}
