// src/main/java/com/example/asplatform/admin/service/AdminCustomerService.java
package com.example.asplatform.admin.service;

import com.example.asplatform.admin.dto.*;
import com.example.asplatform.admin.repository.AdminCustomerRepository;
import com.example.asplatform.common.enums.CustomerStatus;
import com.example.asplatform.customer.domain.Customer;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminCustomerService {

    private final AdminCustomerRepository repo;

    /* PENDING 목록 */
    @Transactional(readOnly = true)
    public Page<CustomerDto> getPending(Pageable pageable) {
        return repo.findByStatus(CustomerStatus.PENDING, pageable).map(this::toDto);
    }

    /* 전체 목록 */
    @Transactional(readOnly = true)
    public Page<CustomerDto> getAll(Pageable pageable) {
        return repo.findAll(pageable).map(this::toDto);
    }

    /* 단건 상세 조회 ─ 내용보기 */
    @Transactional(readOnly = true)
    public CustomerDto getOne(Long id) {
        return toDto(find(id));
    }

    /* 승인 / 반려 */
    public void changeStatus(Long id, CustomerStatus status) {
        Customer c = find(id);
        c.setStatus(status);
        if (status == CustomerStatus.APPROVED) c.setApprovedAt(java.time.LocalDateTime.now());
    }

    /* 정보 수정 */
    public CustomerDto update(Long id, CustomerUpdateRequest req) {
        Customer c = find(id);
        c.setCompanyName(req.getCompanyName());
        c.setCompanyNumber(req.getCompanyNumber());
        c.setAddress(req.getAddress());
        c.setContactName(req.getContactName());
        c.setContactEmail(req.getContactEmail());
        c.setContactPhone(req.getContactPhone());
        c.setOpeningHours(req.getOpeningHours());
        if (req.getBusinessDocUrl() != null)
            c.setBusinessDocUrl(req.getBusinessDocUrl());
        return toDto(c);
    }

    /* 삭제(하드) or 등록취소(소프트→REJECTED) */
    public void delete(Long id, boolean hard) {
        if (hard) repo.deleteById(id);
        else changeStatus(id, CustomerStatus.REJECTED);
    }

    /* ----------------- 내부 ----------------- */
    private Customer find(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("고객사 ID 없음"));
    }

    private CustomerDto toDto(Customer c) {
        CustomerDto d = new CustomerDto();
        d.setId(c.getId());
        d.setCompanyName(c.getCompanyName());
        d.setCompanyNumber(c.getCompanyNumber());
        d.setAddress(c.getAddress());
        d.setContactName(c.getContactName());
        d.setContactEmail(c.getContactEmail());
        d.setContactPhone(c.getContactPhone());
        d.setBusinessDocUrl(c.getBusinessDocUrl());
        d.setOpeningHours(c.getOpeningHours());
        d.setTermsAgreed(c.isTermsAgreed());
        d.setStatus(c.getStatus());
        d.setCreatedAt(String.valueOf(c.getCreatedAt()));
        d.setApprovedAt(c.getApprovedAt() == null ? null : String.valueOf(c.getApprovedAt()));
        return d;
    }
}
