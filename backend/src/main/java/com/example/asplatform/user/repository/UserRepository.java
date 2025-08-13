package com.example.asplatform.user.repository;

import com.example.asplatform.common.enums.Role;
import com.example.asplatform.user.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    // ➕ Role 기준 페이징 조회
    Page<User> findByRole(Role role, Pageable pageable);

    // 고객사 삭제 전: 해당 고객사에 속한 모든 사용자 FK NULL
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("update User u set u.customer = null where u.customer.id = :customerId")
    int clearCustomerByCustomerId(@Param("customerId") Long customerId);

    // ✅ 고객사까지 한 번에 로드
    @Query("select u from User u left join fetch u.customer where u.email = :email")
    Optional<User> findWithCustomerByEmail(@Param("email") String email);
}