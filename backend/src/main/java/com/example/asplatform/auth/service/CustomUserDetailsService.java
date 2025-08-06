// src/main/java/com/example/asplatform/auth/service/CustomUserDetailsService.java
package com.example.asplatform.auth.service;

import com.example.asplatform.user.domain.User;
import com.example.asplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // ① DB에서 이메일로 User 엔티티 조회
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // ② UserDetails 타입으로 변환하여 반환
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),    // 로그인 시 아이디로 사용할 값
                user.getPassword(), // 인증 시 검증할 암호화된 비밀번호
                user.getIsActive(),
                true,
                true,
                true,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())) //사용자에게 부여된 권한 목록
        );
    }
}
