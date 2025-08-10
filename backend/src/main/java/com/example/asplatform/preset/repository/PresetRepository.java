package com.example.asplatform.preset.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.asplatform.preset.domain.Preset;

@Repository
public interface PresetRepository extends JpaRepository<Preset , Long> {
	
	// 특정 카테고리의 아이템으로 프리셋 조회 메소드
	List<Preset> findByCategory_CategoryIdAndItem_ItemId(Long categoryId , Long itemId);
	
	// 프리셋 id로 단일 프리셋 조회하는 메소드
	Preset findByPresetId(Long presetId);
}
