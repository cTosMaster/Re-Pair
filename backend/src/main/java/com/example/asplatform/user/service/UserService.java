// src/main/java/com/example/asplatform/user/service/UserService.java
package com.example.asplatform.user.service;

import com.example.asplatform.common.enums.Role;
import com.example.asplatform.user.domain.User;
import com.example.asplatform.user.domain.UserAddress;
import com.example.asplatform.user.dto.requestDTO.RegisterRequest;
import com.example.asplatform.user.repository.UserAddressRepository;
import com.example.asplatform.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.locationtech.jts.geom.Point;
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
}