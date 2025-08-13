// src/main/java/com/example/asplatform/customer/service/CustomerRegistrationService.java
package com.example.asplatform.customer.service;


import com.example.asplatform.auth.service.CustomUserDetails;
import com.example.asplatform.common.enums.CustomerStatus;
import com.example.asplatform.common.enums.Role;
import com.example.asplatform.customer.domain.Customer;
import com.example.asplatform.customer.domain.CustomerAddress;
import com.example.asplatform.admin.repository.PlatformCategoryRepository;
import com.example.asplatform.category.domain.CustomerCategory;
import com.example.asplatform.customer.dto.requestDTO.CustomerRegistrationRequest;
import com.example.asplatform.customer.dto.responseDTO.CustomerRegistrationResponse;
import com.example.asplatform.customer.repository.CustomerRepository;
import com.example.asplatform.customer.repository.CustomerAddressRepository;
import com.example.asplatform.category.repository.CustomerCategoryRepository;
import com.example.asplatform.user.domain.User;
import com.example.asplatform.user.repository.UserRepository;


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
    private final PlatformCategoryRepository platformCategoryRepository;
    private final CustomerCategoryRepository customerCategoryRepository;
    private final UserRepository userRepository;

    private static final GeometryFactory GF = new GeometryFactory(new PrecisionModel(), 4326);

    /**
     * 현재 로그인 유저 ID를 함께 받아, 등록된 고객사를 해당 유저에 연결
     */
    @Transactional
    public CustomerRegistrationResponse registerCustomer(CustomerRegistrationRequest req, CustomUserDetails me) {

        // 현재 로그인 유저 조회 및 검증
        User meUser = userRepository.findById(me.getId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 역할 검사
        if (meUser.getRole() != Role.CUSTOMER) {
            throw new IllegalStateException("고객사 등록은 CUSTOMER 역할만 가능합니다.");
        }
        if (meUser.getCustomer() != null) {
            throw new IllegalStateException("이미 고객사와 연동된 사용자입니다.");
        }

        // 1) Customer 빌드 및 저장
        Customer customer = customerRepository.save(
                Customer.builder()
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
                        .build()
        );

        // 2) 주소 저장
        Point point = GF.createPoint(new Coordinate(req.getLng(), req.getLat()));
        addressRepository.save(CustomerAddress.builder()
                .customer(customer)
                .postalCode(req.getPostalCode())
                .roadAddress(req.getRoadAddress())
                .detailAddress(req.getDetailAddress())
                .location(point)
                .build());

        // 3) 카테고리 매핑 저장 (effectively final 'customer' 사용)
        platformCategoryRepository.findAllById(req.getCategoryIds())
                .forEach(pc -> customerCategoryRepository.save(
                        CustomerCategory.builder()
                                .customerId(customer.getId())
                                .name(pc.getName())
                                .build()
                ));

        // 4) 응답 생성
        meUser.setCustomer(customer);
        userRepository.save(meUser);

        CustomerRegistrationResponse resp = new CustomerRegistrationResponse();
        resp.setCustomerId(customer.getId());
        resp.setStatus(customer.getStatus().name());
        return resp;
    }
}
