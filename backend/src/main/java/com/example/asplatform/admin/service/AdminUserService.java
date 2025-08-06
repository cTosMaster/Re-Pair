// src/main/java/com/example/asplatform/admin/service/AdminUserService.java
package com.example.asplatform.admin.service;

import com.example.asplatform.admin.dto.*;
import com.example.asplatform.common.enums.Role;
import com.example.asplatform.user.domain.User;
import com.example.asplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminUserService {

    private final UserRepository repo;

    @Transactional(readOnly = true)
    public Page<UserDto> getAll(Role role, Pageable pageable) {
        /* role 파라미터가 null 이면 전체, 아니면 Role 필터 */
        Page<User> page = (role == null) ?
                repo.findAll(pageable) :
                repo.findByRole(role, pageable);

        return page.map(this::toDto);
    }

    public UserDto update(Long id, UserUpdateRequest req) {
        User u = find(id);
        u.setName(req.getName());
        u.setPhone(req.getPhone());
        u.setAddress(req.getAddress());
        u.setImageUrl(req.getImageUrl());
        u.setIsActive(req.isActive());
        return toDto(u);
    }

    public void hardDelete(Long id) {
        repo.deleteById(id);
    }

    public void softDelete(Long id) {
        User u = find(id);
        u.setIsActive(false);
    }

    /* ---------- 내부 ---------- */
    private User find(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("사용자 ID 없음"));
    }

    private UserDto toDto(User u) {
        UserDto d = new UserDto();
        d.setId(u.getId());
        d.setEmail(u.getEmail());
        d.setName(u.getName());
        d.setPhone(u.getPhone());
        d.setAddress(u.getAddress());
        d.setImageUrl(u.getImageUrl());
        d.setRole(u.getRole());
        d.setActive(u.getIsActive());
        d.setCreatedAt(String.valueOf(u.getCreatedAt()));
        return d;
    }
}
