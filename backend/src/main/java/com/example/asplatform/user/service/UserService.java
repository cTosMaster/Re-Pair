// src/main/java/com/example/asplatform/user/service/UserService.java
package com.example.asplatform.user.service;

import com.example.asplatform.common.enums.Role;
import com.example.asplatform.user.domain.User;
import com.example.asplatform.user.domain.UserAddress;
import com.example.asplatform.user.dto.requestDTO.RegisterRequest;
import com.example.asplatform.user.dto.requestDTO.UpdateMyProfileRequest;
import com.example.asplatform.user.dto.responseDTO.MyProfileResponse;
import com.example.asplatform.user.repository.UserAddressRepository;
import com.example.asplatform.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.locationtech.jts.geom.Point;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserAddressRepository userAddressRepository;
    private final PasswordEncoder passwordEncoder;

    /** WGS-84 좌표계(SRID=4326)용 GeometryFactory */
    private static final GeometryFactory gf =
            new GeometryFactory(new PrecisionModel(), 4326);

    @Transactional
    public void register(RegisterRequest req) {
        // 1) 비밀번호 확인 일치 검사
        if (!req.getPassword().equals(req.getPasswordConfirm())) {
            throw new IllegalArgumentException("비밀번호와 확인이 일치하지 않습니다.");
        }
        // 2) 이메일 중복 검사
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        // 3) User 저장
        User u = User.builder()
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .name(req.getName())
                .phone(req.getPhone())
                .imageUrl(req.getImageUrl())
                .role(Role.valueOf(req.getRole()))
                .isActive(true)
                .build();
        userRepository.save(u);

        // 4) UserAddress 저장
        //    - POINT(lng, lat) 생성 (경도, 위도 순서)
        Point point = gf.createPoint(new Coordinate(req.getLng(), req.getLat()));

        UserAddress ua = new UserAddress();
        ua.setUser(u);                      // PK=FK 매핑
        ua.setPostalCode(req.getPostalCode());
        ua.setRoadAddress(req.getRoadAddress());
        ua.setDetailAddress(req.getDetailAddress());
        ua.setLocation(point);

        userAddressRepository.save(ua);
    }

    /* ---------- 마이페이지: 공통 유틸 ---------- */
    private String currentEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("인증 정보가 없습니다.");
        }
        return auth.getName();
    }

    private MyProfileResponse toMyProfileResponse(User user, UserAddress addr) {
        Double lat = null, lng = null;
        if (addr != null && addr.getLocation() != null) {
            // JTS: Point.getX()=경도(lng), getY()=위도(lat)
            lng = addr.getLocation().getX();
            lat = addr.getLocation().getY();
        }
        return MyProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .phone(user.getPhone())
                .imageUrl(user.getImageUrl())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastLogin(user.getLastLogin())
                .postalCode(addr != null ? addr.getPostalCode() : null)
                .roadAddress(addr != null ? addr.getRoadAddress() : null)
                .detailAddress(addr != null ? addr.getDetailAddress() : null)
                .lat(lat)
                .lng(lng)
                .build();
    }

    /* ---------- 마이페이지: 조회 ---------- */
    @Transactional
    public MyProfileResponse getMyProfile() {
        String email = currentEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserAddress addr = userAddressRepository.findById(user.getId()).orElse(null);
        return toMyProfileResponse(user, addr);
    }

    /* ---------- 마이페이지: 수정 (부분 업데이트) ---------- */
    @Transactional
    public MyProfileResponse updateMyProfile(UpdateMyProfileRequest req) {
        String email = currentEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 기본 정보
        if (req.getName() != null) user.setName(req.getName());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getImageUrl() != null) user.setImageUrl(req.getImageUrl());

        // 주소
        UserAddress addr = userAddressRepository.findById(user.getId()).orElse(null);
        if (addr == null && (req.getPostalCode()!=null || req.getRoadAddress()!=null
                || req.getDetailAddress()!=null || req.getLat()!=null || req.getLng()!=null)) {
            addr = new UserAddress();
            addr.setUser(user); // @MapsId - PK=FK
        }
        if (addr != null) {
            if (req.getPostalCode() != null)   addr.setPostalCode(req.getPostalCode());
            if (req.getRoadAddress() != null)  addr.setRoadAddress(req.getRoadAddress());
            if (req.getDetailAddress() != null) addr.setDetailAddress(req.getDetailAddress());

            // 좌표는 둘 다 있을 때만 갱신
            if (req.getLat() != null && req.getLng() != null) {
                Point p = gf.createPoint(new Coordinate(req.getLng(), req.getLat()));
                addr.setLocation(p);
            }
            userAddressRepository.save(addr);
        }

        // flush는 트랜잭션 종료 시점
        return toMyProfileResponse(user, addr);
    }

    /* ---------- 마이페이지: 소프트 탈퇴 ---------- */
    @Transactional
    public void deactivateMyAccount() {
        String email = currentEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (Boolean.FALSE.equals(user.getIsActive())) {
            return; // 이미 비활성화
        }
        user.setIsActive(false);
    }
}