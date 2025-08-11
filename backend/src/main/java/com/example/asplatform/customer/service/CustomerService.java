package com.example.asplatform.customer.service;

import com.example.asplatform.customer.domain.Customer;
import com.example.asplatform.customer.dto.responseDTO.CustomerResponse;
import com.example.asplatform.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    /** 전체 고객(페이징/정렬) */
    public Page<CustomerResponse> getCustomers(Pageable pageable) {
        return customerRepository.findAll(pageable)
                .map(CustomerResponse::from);
    }

    /** 키워드 검색(부분 일치, 대소문자 무시) */
    public Page<CustomerResponse> searchCustomers(String keyword, Pageable pageable) {
        return customerRepository.findByCompanyNameContainingIgnoreCase(keyword, pageable)
                .map(CustomerResponse::from);
    }

    /** 고객사 상세 조회 */
    public CustomerResponse getCustomerDetail(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("해당 고객을 찾을 수 없습니다. ID=" + customerId));
        return CustomerResponse.from(customer);
    }
}
