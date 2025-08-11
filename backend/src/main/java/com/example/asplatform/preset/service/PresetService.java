package com.example.asplatform.preset.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.asplatform.admin.repository.PlatformCategoryRepository;
import com.example.asplatform.item.repository.RepairableItemRepository;
import com.example.asplatform.preset.domain.Preset;
import com.example.asplatform.preset.dto.requestDTO.PresetRequestDto;
import com.example.asplatform.preset.dto.responseDTO.PresetResponseDto;
import com.example.asplatform.preset.repository.PresetRepository;


import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PresetService {
	
	private final PresetRepository presetRepository;
	private final PlatformCategoryRepository platformCategoryRepository;
	private final RepairableItemRepository repairableItemRepository;
	
	/**
	 * ✅ 1. 프리셋 전체 목록 조회하기
	 * @return
	 */
	public List<PresetResponseDto> getAllPreset() {
		List<Preset> presets = presetRepository.findAll();
		return presets.stream()
				.map(this::convertToResponseDto)
				.collect(Collectors.toList());
	}
	
	/**
	 * ✅ 2. 아이템 + 카테고리별 프리셋 조회하기
	 * @param categoryId
	 * @param itemId
	 * @return
	 */
	public List<PresetResponseDto> getPresetsByCategoryAndItem(Long categoryId, Long itemId) {
		List<Preset> presets = presetRepository.findByCategory_CategoryIdAndItem_ItemId(categoryId, itemId);
		return presets.stream()
				.map(this::convertToResponseDto)
				.collect(Collectors.toList());
	}
	
	/**
	 * ✅ 3. 프리셋 등록하기
	 * @param dto
	 * @return
	 */
	public PresetResponseDto createPreset(PresetRequestDto dto) {
		var category = platformCategoryRepository.findById(dto.getCategoryId())
				.orElseThrow(()-> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));
		var item = repairableItemRepository.findById(dto.getItemId())
				.orElseThrow(()-> new IllegalArgumentException("제품을 찾을 수 없습니다."));
		
		Preset preset = new Preset();
        preset.setCategory(category);
        preset.setItem(item);
        preset.setName(dto.getName());
        preset.setDescription(dto.getDescription());
        preset.setPrice(dto.getPrice());

        Preset savedPreset = presetRepository.save(preset);

        return convertToResponseDto(savedPreset);
	}
	
	/**
	 * ✅ 4. 프리셋 수정하기
	 * @param presetId
	 * @param dto
	 * @return
	 */
	public PresetResponseDto updatePreset(Long presetId , PresetRequestDto dto) {
		// 프리셋 아이디로 프리셋 찾기 
		Preset preset = presetRepository.findById(presetId)
	                .orElseThrow(() -> new IllegalArgumentException("Preset not found"));
		
		var category = platformCategoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        var item = repairableItemRepository.findById(dto.getItemId())
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

        preset.setCategory(category);
        preset.setItem(item);
        preset.setName(dto.getName());
        preset.setDescription(dto.getDescription());
        preset.setPrice(dto.getPrice());

        Preset updatedPreset = presetRepository.save(preset);
        return convertToResponseDto(updatedPreset);
	}
	
	/**
	 * ✅ 5. 프리셋 삭제하기
	 * @param presetId
	 */
	public void deletePreset(Long presetId) {
		Preset preset = presetRepository.findById(presetId)
				.orElseThrow(() -> new IllegalArgumentException("프리셋을 찾을 수 없습니다."));
		
		 presetRepository.delete(preset);
	}
	
	/**
	 * ✅ 6. 프리셋 금액 자동 계산하기
	 * @param presetIds
	 * @return
	 */
	public Integer calculatePrice(List<Long> presetIds) {
		int totalPrice = 0;
		
		for(Long presetId : presetIds) {
			Optional<Preset> preset = presetRepository.findById(presetId);
			if(preset.isPresent()) {
				totalPrice += preset.get().getPrice();
			}
		}
		return totalPrice;
	}
	
	/**
	 * ✅ 7. 단일 프리셋 견적 미리 보기
	 * @param presetId
	 * @return
	 */
	public PresetResponseDto getPresetPreview(Long presetId) {
		Preset preset = presetRepository.findById(presetId)
				.orElseThrow(()-> new IllegalArgumentException("프리셋을 찾을 수 없습니다."));
		return convertToResponseDto(preset);
	}
	
	/**
	 * converToResponseDto 메소드
	 */
	private PresetResponseDto convertToResponseDto(Preset preset) {
        PresetResponseDto responseDTO = new PresetResponseDto();
        responseDTO.setPresetId(preset.getPresetId());
        responseDTO.setCategoryId(preset.getCategory().getCategoryId());
        responseDTO.setItemId(preset.getItem().getItemId());
        responseDTO.setName(preset.getName());
        responseDTO.setDescription(preset.getDescription());
        responseDTO.setPrice(preset.getPrice());
        responseDTO.setCreatedAt(preset.getCreatedAt());
        return responseDTO;
    }
	
	
}