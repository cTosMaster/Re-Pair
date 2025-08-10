package com.example.asplatform.category.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.asplatform.category.domain.PlatformCategory;

@Repository
public interface PlatformCategoryRepository extends JpaRepository<PlatformCategory , Long> {

	// 카테고리 id로 카테고리 조회하기 
	Optional<PlatformCategory> findById(Long id);
	
}
