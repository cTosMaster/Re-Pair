package com.example.asplatform.user.repository;

import com.example.asplatform.user.domain.UserAddress;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {

	// 하드 삭제 전에 주소 선삭제
	void deleteByUserId(Long userId);

	// 여러 개의 고객 ID로 주소 조회
	@Query("select a from UserAddress a where a.user.id in :userIds")
	List<UserAddress> findByUserIds(@Param("userIds") Collection<Long> userIds);
}
