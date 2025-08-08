package com.example.asplatform.customer.service;

import com.example.asplatform.customer.domain.Customer;
import com.example.asplatform.customer.dto.responseDTO.CustomerResponse;
import com.example.asplatform.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    //전체 고객 조회
    public List<CustomerResponse> getAllCustomers() {
        List<Customer> customers = customerRepository.findAll();
        return customers.stream()
                .map(CustomerResponse::from)
                .collect(Collectors.toList());
    }

    // 키워드 검색
    public List<CustomerResponse> searchCustomers(String keyword) {
        List<Customer> customers = customerRepository.findByCompanyName(keyword);
        return customers.stream()
                .map(CustomerResponse::from)
                .collect(Collectors.toList());
    }

    // 고객사 상세 조회
    public CustomerResponse getCustomerDetail(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("해당 고객을 찾을 수 없습니다. ID=" + customerId));
        return CustomerResponse.from(customer);
    }
}
