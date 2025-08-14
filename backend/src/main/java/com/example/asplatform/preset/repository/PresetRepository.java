package com.example.asplatform.preset.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.asplatform.preset.domain.Preset;

@Repository
public interface PresetRepository extends JpaRepository<Preset , Long> {
	
	// 특정 카테고리의 아이템으로 프리셋 조회 메소드
	List<Preset> findByCategory_CategoryIdAndItem_ItemId(Long categoryId , Long itemId);
	
	// 프리셋 id로 단일 프리셋 조회하는 메소드
	Preset findByPresetId(Long presetId);
	
    // 정확한 개수 검증을 위한 카운트 메서드
    @Query("select count(p.id) from Preset p where p.id in :ids")
    long countByIdIn(@Param("ids") Collection<Long> ids);
	
}
