package com.example.asplatform.preset.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.asplatform.preset.domain.Preset;

@Repository
public interface PresetRepository extends JpaRepository<Preset, Long> {

	// 특정 카테고리의 아이템으로 프리셋 조회 메소드
	Page<Preset> findByCategory_CategoryIdAndItem_ItemId(Long categoryId, Long itemId, Pageable pageable);

	// 프리셋 id로 단일 프리셋 조회하는 메소드
	Preset findByPresetId(Long presetId);

	// 정확한 개수 검증을 위한 카운트 메서드
	@Query("select count(p.id) from Preset p where p.id in :ids")
	long countByIdIn(@Param("ids") Collection<Long> ids);
	
	// 고객사 소속 + 미삭제 프리셋만 카운트
    long countByPresetIdInAndCustomerIdAndIsDeletedFalse(List<Long> ids, Long customerId);
  
    
    // 합계 계산 및 사용내역 저장을 위한 조회도 고객사 한정
    List<Preset> findByPresetIdInAndCustomerIdAndIsDeletedFalse(List<Long> ids, Long customerId);
    

	// 고객사 아이디로 조회하기
	Page<Preset> findByCustomer_Id(Long cusotmerId, Pageable pageable);

	// 고객사 아이디 카테고리 아이디 , 제품 아이디로 조회하기
	Page<Preset> findByCustomer_IdAndCategory_CategoryIdAndItem_ItemId(Long customerId, Long categoryId, Long itemId,
			Pageable pageable);

}
