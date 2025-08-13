// src/main/java/com/example/asplatform/location/service/LocationService.java
package com.example.asplatform.location.service;

import com.example.asplatform.location.dto.*;
import com.example.asplatform.user.domain.User;
import com.example.asplatform.user.domain.UserAddress;
import com.example.asplatform.user.repository.UserAddressRepository;
import com.example.asplatform.user.repository.UserRepository;
import com.example.asplatform.customer.domain.CustomerAddress;
import com.example.asplatform.customer.repository.CustomerAddressRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Point;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final UserRepository userRepository;
    private final UserAddressRepository userAddressRepository;
    private final CustomerAddressRepository customerAddressRepository;

    /** 로그인한 사용자 위치 + 모든 고객사 위치/정보 반환  */
    @Transactional(readOnly = true)
    public MapPinsResponse getPins() {
        MeLocationDto me = loadMe();

        // 모든 고객사 주소 + 기타 고개사 정보들 조회
        List<CustomerAddress> addresses = customerAddressRepository.findAll();

        List<CustomerPinDto> customers = addresses.stream()
                .map(a -> {
                    Point p = a.getLocation();
                    double lat = p.getY(); // 위도
                    double lng = p.getX(); // 경도
                    return CustomerPinDto.builder()
                            .customerId(a.getCustomer().getId())
                            .companyName(a.getCustomer().getCompanyName()) // 고객사명
                            .contactEmail(a.getCustomer().getContactEmail()) // 담당자 이메일
                            .contactPhone(a.getCustomer().getContactPhone()) // 담당자 전화번호
                            .openingHours(a.getCustomer().getOpeningHours()) // 센터 영업 시간
                            .point(new GeoPointDto(lat, lng))
                            .build();
                })
                .collect(Collectors.toList());

        return MapPinsResponse.builder()
                .me(me)
                .customers(customers)
                .build();
    }

    /** 현재 로그인 사용자 + 위치 (주소 없으면 point=null) */
    private MeLocationDto loadMe() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) return null;

        String email = auth.getName(); // CustomUserDetailsService에서 username=email 가정
        Optional<User> optUser = userRepository.findByEmail(email);
        if (optUser.isEmpty()) return null;

        User user = optUser.get();

        // user_addresses PK = users.id 이므로 findById 사용
        Optional<UserAddress> optAddr = userAddressRepository.findById(user.getId());

        GeoPointDto point = null;
        if (optAddr.isPresent() && optAddr.get().getLocation() != null) {
            Point p = optAddr.get().getLocation();
            point = new GeoPointDto(p.getY(), p.getX()); // (lat, lng)
        }

        return MeLocationDto.builder()
                .userId(user.getId())
                .name(user.getName())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .point(point)
                .build();
    }
}
