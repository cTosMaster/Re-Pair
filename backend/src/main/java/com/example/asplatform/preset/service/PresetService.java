/*package com.example.asplatform.preset.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.asplatform.category.domain.PlatformCategory;
import com.example.asplatform.preset.domain.Preset;
import com.example.asplatform.preset.dto.requestDTO.PresetRequestDto;
import com.example.asplatform.preset.dto.responseDTO.PresetResponseDto;
import com.example.asplatform.preset.repository.PresetRepository;
import com.example.asplatform.repair.domain.RepairableItem;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PresetService {
	 private final PresetRepository presetRepository;
	    private final RepairableItemRepository repairableItemRepository;
	    private final PlatformCategoryRepository platformCategoryRepository;
	    
	    /**
	     * ✅ 1. 프리셋 목록 전체 조회하기
	     */
	    /*@Transactional
	    public List<PresetResponseDto> getAllPresets() {
	        return presetRepository.findAll().stream()
	            .map(PresetResponseDto::from)
	            .collect(Collectors.toList());
	    }
	    
	    
	    /**
	     * ✅ 2. 카테고리 + 제품 필터링 프리셋 조회하기
	     */
	    /*@Transactional
	    public List<PresetResponseDto> getFilteredPresets(Long categoryId, Long itemId) {
	        return presetRepository.findByCategory_CategoryIdAndItem_ItemId(categoryId, itemId).stream()
	            .map(PresetResponseDto::from)
	            .collect(Collectors.toList());
	    }
	    
	    
	    /**
	     * ✅ 3. 프리셋 등록하기
	     */
	    /*public PresetResponseDto createPreset(PresetRequestDto request) {
	        PlatformCategory category = categoryRepository.findById(dto.getCategoryId())
	                .orElseThrow(() -> new IllegalArgumentException("카테고리 없음"));

	        RepairableItem item = itemRepository.findById(dto.getItemId())
	                .orElseThrow(() -> new IllegalArgumentException("제품 없음"));

	        Preset preset = Preset.builder()
	                .category(category)
	                .item(item)
	                .name(dto.getName())
	                .description(dto.getDescription())
	                .price(dto.getPrice())
	                .build();

	        return toDto(presetRepository.save(preset));
	    }
	    
	    
	    
	    
	    /**
	     * ✅ 4. 프리셋 수정하기
	     */
	    /*public PresetResponseDto updatePreset(Long presetId, PresetRequestDto dto) {
	        Preset preset = presetRepository.findById(presetId)
	                .orElseThrow(() -> new IllegalArgumentException("프리셋 없음"));

	        preset.setName(dto.getName());
	        preset.setDescription(dto.getDescription());
	        preset.setPrice(dto.getPrice());

	        return toDto(presetRepository.save(preset));
	    }
	    
	    
	    /**
	     * ✅ 5. 프리셋 삭제하기
	     */
	   /* public void deletePreset(Long presetId) {
	        presetRepository.deleteById(presetId);
	    }
	    
	    
	    /**
	     * ✅ 6. 단일 프리셋 미리 보기 
	     */
	   /* @Transactional
	    public PresetResponseDto previewPreset(Long presetId) {
	        Preset preset = presetRepository.findById(presetId)
	                .orElseThrow(() -> new IllegalArgumentException("프리셋 없음"));
	        return toDto(preset);
	    }
	    
	    
	    
	    /**
	     * ✅ 7. 프리셋 가격 합산 계산하기
	     */
	    /*@Transactional(readOnly = true)
	    public int calculateTotalPrice(List<Long> presetIds) {
	        return presetRepository.findAllById(presetIds)
	                .stream()
	                .mapToInt(Preset::getPrice)
	                .sum();
	    }
	    
	    
	    /**
	     * ✅ preset 엔티티 -> dto 변환 메소드
	     */

//}
