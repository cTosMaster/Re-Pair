package com.example.asplatform.admin.service;

import com.example.asplatform.admin.dto.UserDto;
import com.example.asplatform.admin.dto.UserUpdateRequest;
import com.example.asplatform.common.enums.Role;
import com.example.asplatform.user.domain.User;
import com.example.asplatform.user.domain.UserAddress;
import com.example.asplatform.user.repository.UserAddressRepository;
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
public class AdminUserService {

    private final UserRepository userRepo;
    private final UserAddressRepository addrRepo;

    // WGS-84(SRID=4326)용 GeometryFactory
    private static final GeometryFactory gf =
            new GeometryFactory(new PrecisionModel(), 4326);

    @Transactional(readOnly = true)
    public Page<UserDto> getAll(Role role, Pageable pageable) {
        Page<User> page = (role == null)
                ? userRepo.findAll(pageable)
                : userRepo.findByRole(role, pageable);
        return page.map(this::toDto);
    }

    public UserDto update(Long id, UserUpdateRequest req) {
        User u = find(id);
        // 기본 필드
        u.setName(req.getName());
        u.setPhone(req.getPhone());
        u.setImageUrl(req.getImageUrl());
        u.setIsActive(req.isActive());

        // 주소 처리
        UserAddress addr = u.getAddress();
        if (addr == null) {
            addr = new UserAddress();
            addr.setUser(u);
        }
        addr.setPostalCode(req.getPostalCode());
        addr.setRoadAddress(req.getRoadAddress());
        addr.setDetailAddress(req.getDetailAddress());
        Point point = gf.createPoint(new Coordinate(req.getLng(), req.getLat()));
        addr.setLocation(point);
        addrRepo.save(addr);

        return toDto(u);
    }

    public void hardDelete(Long id) {
        userRepo.deleteById(id);
    }

    public void softDelete(Long id) {
        User u = find(id);
        u.setIsActive(false);
    }

    private User find(Long id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("사용자 ID 없음: " + id));
    }

    private UserDto toDto(User u) {
        UserDto d = new UserDto();
        d.setId(u.getId());
        d.setEmail(u.getEmail());
        d.setName(u.getName());
        d.setPhone(u.getPhone());
        d.setImageUrl(u.getImageUrl());
        d.setRole(u.getRole());
        d.setActive(u.getIsActive());
        d.setCreatedAt(String.valueOf(u.getCreatedAt()));

        UserAddress addr = u.getAddress();
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
