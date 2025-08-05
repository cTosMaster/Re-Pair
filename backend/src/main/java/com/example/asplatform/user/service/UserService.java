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
        // 1) 비밀번호 확인
        if (!req.getPassword().equals(req.getPasswordConfirm())) {
            throw new IllegalArgumentException("비밀번호와 확인이 일치하지 않습니다.");
        }
        // 2) 이메일 중복 체크
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
                .imageUrl(req.getImageUrl())
                .role(Role.valueOf(req.getRole()))
                .isActive(true)
                .build();
        userRepository.save(u);
    }
}
