package com.example.asplatform.user.repository;

import com.example.asplatform.common.enums.Role;
import com.example.asplatform.user.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    // ➕ Role 기준 페이징 조회
    Page<User> findByRole(Role role, Pageable pageable);
}