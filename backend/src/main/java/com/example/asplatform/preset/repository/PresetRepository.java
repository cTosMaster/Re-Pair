package com.example.asplatform.preset.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.asplatform.preset.domain.Preset;

@Repository
public interface PresetRepository extends JpaRepository<Preset , Long> {
	
	// 특정 카테고리의 아이템으로 프리셋 조회 메소드
	Page<Preset> findByCategory_CategoryIdAndItem_ItemId(Long categoryId , Long itemId, Pageable pageable);
	
	// 프리셋 id로 단일 프리셋 조회하는 메소드
	Preset findByPresetId(Long presetId);
	
	// 고객사 아이디로 조회하기
	Page<Preset> findByCustomer_Id(Long cusotmerId , Pageable pageable);
	
	//고객사 아이디 카테고리 아이디 , 제품 아이디로 조회하기
	Page<Preset> findByCustomer_IdAndCategory_CategoryIdAndItem_ItemId(Long customerId , Long categoryId , Long itemId , Pageable pageable);
}
