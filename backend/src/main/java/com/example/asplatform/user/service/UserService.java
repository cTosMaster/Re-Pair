// src/main/java/com/example/asplatform/user/service/UserService.java
package com.example.asplatform.user.service;

import com.example.asplatform.common.enums.Role;
import com.example.asplatform.user.domain.User;
import com.example.asplatform.user.dto.requestDTO.RegisterRequest;
import com.example.asplatform.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void register(RegisterRequest req) {
        // 1) 비밀번호 확인 일치 검사
        if (!req.getPassword().equals(req.getPasswordConfirm())) {
            throw new IllegalArgumentException("비밀번호와 확인이 일치하지 않습니다.");
        }
        // 2) 이메일 중복 검사: 이미 가입된 이메일이면 예외
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
        // 3) 저장
        User u = User.builder()
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .name(req.getName())
                .phone(req.getPhone())
                .address(req.getAddress())
                .imageUrl(req.getImageUrl()) // 프로필 이미지 URL (선택)
                .role(Role.valueOf(req.getRole()))  // Role enum 변환 (USER, CUSTOMER 등)
                .isActive(true)
                .build();
        userRepository.save(u);
    }
}
