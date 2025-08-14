package com.example.asplatform.admin.service;

import com.example.asplatform.admin.dto.CustomerDto;
import com.example.asplatform.admin.dto.CustomerUpdateRequest;
import com.example.asplatform.category.repository.CustomerCategoryRepository;
import com.example.asplatform.common.enums.CustomerStatus;
import com.example.asplatform.customer.domain.Customer;
import com.example.asplatform.customer.domain.CustomerAddress;
import com.example.asplatform.admin.repository.AdminCustomerRepository;
import com.example.asplatform.customer.repository.CustomerAddressRepository;
import com.example.asplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.locationtech.jts.geom.Point;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminCustomerService {

    private final AdminCustomerRepository customerRepo;
    private final CustomerAddressRepository addrRepo;
    private final UserRepository userRepo;
    private final CustomerCategoryRepository customerCategoryRepo;

    private static final GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 4326);

    @Transactional(readOnly = true)
    public Page<CustomerDto> getPending(Pageable pageable) {
        return customerRepo.findByStatus(CustomerStatus.PENDING, pageable)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<CustomerDto> getAll(Pageable pageable) {
        // 승인된 고객사 목록만 반환
        return customerRepo.findByStatus(CustomerStatus.APPROVED, pageable)
                .map(this::toDto);
    }


    @Transactional(readOnly = true)
    public CustomerDto getOne(Long id) {
        return toDto(find(id));
    }

    public void changeStatus(Long id, CustomerStatus status) {
        Customer c = find(id);
        c.setStatus(status);
        if (status == CustomerStatus.APPROVED) {
            c.setApprovedAt(java.time.LocalDateTime.now());
        }
    }

    public CustomerDto update(Long id, CustomerUpdateRequest req) {
        Customer c = find(id);
        c.setCompanyName(req.getCompanyName());
        c.setCompanyNumber(req.getCompanyNumber());
        c.setContactName(req.getContactName());
        c.setContactEmail(req.getContactEmail());
        c.setContactPhone(req.getContactPhone());
        c.setOpeningHours(req.getOpeningHours());
        if (req.getBusinessDocUrl() != null) {
            c.setBusinessDocUrl(req.getBusinessDocUrl());
        }
        // 주소 처리
        CustomerAddress addr = c.getAddress();
        if (addr == null) {
            addr = new CustomerAddress();
            addr.setCustomer(c);
        }
        addr.setPostalCode(req.getPostalCode());
        addr.setRoadAddress(req.getRoadAddress());
        addr.setDetailAddress(req.getDetailAddress());
        Point point = gf.createPoint(new Coordinate(req.getLng(), req.getLat()));
        addr.setLocation(point);
        addrRepo.save(addr);

        return toDto(c);
    }

    public void delete(Long id, boolean hard) {
        if (hard) {
            // 1) users.customer_id -> NULL
            userRepo.clearCustomerByCustomerId(id);

            // 2) 고객사 카테고리 선삭제 (연관관계 매핑/DB CASCADE가 없기 때문)
            customerCategoryRepo.deleteByCustomerId(id);

            // 3) 마지막으로 고객사 삭제
            customerRepo.deleteById(id);
        } else {
            changeStatus(id, CustomerStatus.REJECTED);
        }
    }

    private Customer find(Long id) {
        return customerRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("고객사 ID 없음: " + id));
    }

    private CustomerDto toDto(Customer c) {
        CustomerDto d = new CustomerDto();
        d.setId(c.getId());
        d.setCompanyName(c.getCompanyName());
        d.setCompanyNumber(c.getCompanyNumber());
        d.setContactName(c.getContactName());
        d.setContactEmail(c.getContactEmail());
        d.setContactPhone(c.getContactPhone());
        d.setBusinessDocUrl(c.getBusinessDocUrl());
        d.setOpeningHours(c.getOpeningHours());
        d.setTermsAgreed(c.isTermsAgreed());
        d.setStatus(c.getStatus());
        d.setCreatedAt(String.valueOf(c.getCreatedAt()));
        d.setApprovedAt(c.getApprovedAt() == null ? null : String.valueOf(c.getApprovedAt()));

        CustomerAddress addr = c.getAddress();
        if (addr != null) {
            d.setPostalCode(addr.getPostalCode());
            d.setRoadAddress(addr.getRoadAddress());
            d.setDetailAddress(addr.getDetailAddress());
            d.setLat(addr.getLocation().getY());
            d.setLng(addr.getLocation().getX());
        }
        return d;
    }
}
