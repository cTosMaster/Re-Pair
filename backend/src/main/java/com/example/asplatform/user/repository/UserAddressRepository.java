package com.example.asplatform.user.repository;

import com.example.asplatform.user.domain.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {

    // 하드 삭제 전에 주소 선삭제
    void deleteByUserId(Long userId);
}

