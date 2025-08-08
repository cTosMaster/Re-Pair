// src/main/java/com/example/asplatform/customer/service/CustomerRegistrationService.java
package com.example.asplatform.customer.service;

import com.example.asplatform.admin.repository.PlatformCategoryRepository;
import com.example.asplatform.common.enums.CustomerStatus;
import com.example.asplatform.customer.domain.Customer;
import com.example.asplatform.customer.domain.CustomerAddress;
import com.example.asplatform.category.domain.CustomerCategory;
import com.example.asplatform.customer.dto.requestDTO.CustomerRegistrationRequest;
import com.example.asplatform.customer.dto.responseDTO.CustomerRegistrationResponse;
import com.example.asplatform.customer.repository.CustomerRepository;
import com.example.asplatform.customer.repository.CustomerAddressRepository;
import com.example.asplatform.category.repository.CustomerCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CustomerRegistrationService {
    private final CustomerRepository customerRepository;
    private final CustomerAddressRepository addressRepository;
    private final PlatformCategoryRepository platformCategoryRepository; // admin 패키지
    private final CustomerCategoryRepository customerCategoryRepository;

    private static final GeometryFactory GF = new GeometryFactory(new PrecisionModel(), 4326);

    @Transactional
    public CustomerRegistrationResponse registerCustomer(CustomerRegistrationRequest req) {
        // 1) Customer 빌드 및 저장
        Customer toSave = Customer.builder()
                .companyName(req.getCompanyName())
                .companyNumber(req.getCompanyNumber())
                .contactName(req.getContactName())
                .contactEmail(req.getContactEmail())
                .contactPhone(req.getContactPhone())
                .businessDocUrl(req.getBusinessDocUrl())
                .openingHours(req.getOpeningHours())
                .isTermsAgreed(true)
                .status(CustomerStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        Customer customer = customerRepository.save(toSave);

        // 2) 주소 저장
        Point point = GF.createPoint(new Coordinate(req.getLng(), req.getLat()));
        CustomerAddress address = CustomerAddress.builder()
                .customer(customer)
                .postalCode(req.getPostalCode())
                .roadAddress(req.getRoadAddress())
                .detailAddress(req.getDetailAddress())
                .location(point)
                .build();
        addressRepository.save(address);

        // 3) 카테고리 매핑 저장 (effectively final 'customer' 사용)
        platformCategoryRepository.findAllById(req.getCategoryIds())
                .forEach(pc -> {
                    CustomerCategory cc = CustomerCategory.builder()
                            .customerId(customer.getId())
                            .name(pc.getName())
                            .build();
                    customerCategoryRepository.save(cc);
                });

        // 4) 응답 생성
        CustomerRegistrationResponse resp = new CustomerRegistrationResponse();
        resp.setCustomerId(customer.getId());
        resp.setStatus(customer.getStatus().name());
        return resp;
    }
}
