package com.example.asplatform.category.service;

import com.example.asplatform.category.domain.CustomerCategory;
import com.example.asplatform.category.dto.requestDTO.CustomerCategoryRequest;
import com.example.asplatform.category.dto.responseDTO.CustomerCategoryResponse;
import com.example.asplatform.category.repository.CustomerCategoryRepository;
import com.example.asplatform.customer.domain.Customer;
import com.example.asplatform.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerCategoryService {

    private final CustomerCategoryRepository customerCategoryRepository;
    private final CustomerRepository customerRepository;

    public void addCustomerCategory(Long customerId, CustomerCategoryRequest dto) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("고객사를 찾을 수 없습니다."));

        CustomerCategory category = CustomerCategory.builder()
                .customer(customer)
                .name(dto.getName())
                .build();

        customerCategoryRepository.save(category);
    }

    public List<CustomerCategoryResponse> getCustomerCategories(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("고객사를 찾을 수 없습니다."));

        return customerCategoryRepository.findByCustomer(customer).stream()
                .map(CustomerCategoryResponse::from)
                .collect(Collectors.toList());
    }
}
