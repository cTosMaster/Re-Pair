// src/main/java/com/example/asplatform/admin/repository/PlatformCategoryRepository.java
package com.example.asplatform.admin.repository;

import com.example.asplatform.admin.domain.PlatformCategory;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PlatformCategoryRepository extends JpaRepository<PlatformCategory, Long> {
    boolean existsByName(String name);
 // 카테고리 id로 카테고리 조회하기 
 	Optional<PlatformCategory> findById(Long id);
}
