package com.example.asplatform.preset.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.asplatform.preset.dto.requestDTO.PresetRequestDto;
import com.example.asplatform.preset.dto.responseDTO.PresetResponseDto;
import com.example.asplatform.preset.service.PresetService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/presets")
@RequiredArgsConstructor
public class PresetController {
	
	private final PresetService presetService;
	
	/**
	 * ✅ 1. 프리셋 전체 조회하기
	 * @return
	 */
	@GetMapping(params = {"!categoryId", "!itemId"})
	public ResponseEntity<List<PresetResponseDto>> getPresets(@AuthenticationPrincipal UserDetails userDetails){
		List<PresetResponseDto> presets = presetService.getAllPreset();
		return new ResponseEntity<>(presets, HttpStatus.OK);
		
	}
	
	/**
	 * ✅ 2. 아이템 + 카테고리별 프리셋 조회하기
	 * @param categoryId
	 * @param itemId
	 * @return
	 */
	@GetMapping(params = {"categoryId", "itemId"})
	public ResponseEntity<List<PresetResponseDto>> filterPresets(@RequestParam Long categoryId , @RequestParam Long itemId, @AuthenticationPrincipal UserDetails userDetails) {
		List<PresetResponseDto> presets = presetService.getPresetsByCategoryAndItem(categoryId, itemId);
		return new ResponseEntity<>(presets, HttpStatus.OK);
	}
	
	/**
	 * ✅ 3. 프리셋 등록하기
	 * @param dto
	 * @return
	 */
	@PostMapping
	public ResponseEntity<PresetResponseDto> createPrest(@RequestBody PresetRequestDto dto, @AuthenticationPrincipal UserDetails userDetails) {
		PresetResponseDto createdPreset = presetService.createPreset(dto);
		return new ResponseEntity<>(createdPreset , HttpStatus.CREATED);
	}
	
	/**
	 * ✅ 4. 프리셋 수정하기 
	 * @param presetId
	 * @param dto
	 * @return
	 */
	@PutMapping("/{presetId}")
	public ResponseEntity<PresetResponseDto> updatePreset(@PathVariable Long presetId, @RequestBody PresetRequestDto dto, @AuthenticationPrincipal UserDetails userDetails) {
		PresetResponseDto updatePreset = presetService.updatePreset(presetId, dto);
		return new ResponseEntity<>(updatePreset , HttpStatus.OK);
	}
	
	/**
	 * ✅ 5. 프리셋 삭제하기
	 * @param presetId
	 * @return
	 */
	@DeleteMapping("/{presetId}")
	public ResponseEntity<Void> deletePreset(@PathVariable Long presetId, @AuthenticationPrincipal UserDetails userDetails) {
		presetService.deletePreset(presetId);
		return new ResponseEntity<>(HttpStatus.NO_CONTENT);
	}
	
	/**
	 * ✅ 6. 프리셋 자동 금액 계산하기
	 * @param presetIds
	 * @return
	 */
	@PostMapping("/calculate")
	public ResponseEntity<Integer> calculatePrice(@RequestBody List<Long> presetIds, @AuthenticationPrincipal UserDetails userDetails){
		int totalPrice = presetService.calculatePrice(presetIds);
		return new ResponseEntity<>(totalPrice, HttpStatus.OK);
			
	}
	
	/**
	 * ✅ 7. 단일 프리셋 견적 미리보기 
	 * @param presetId
	 * @return
	 */
	@PostMapping("/{presetId}")
	public ResponseEntity<PresetResponseDto> getPresetPreview(@PathVariable Long presetId, @AuthenticationPrincipal UserDetails userDetails) {
		PresetResponseDto preset = presetService.getPresetPreview(presetId);
		return new ResponseEntity<>(preset, HttpStatus.OK);
	}
	
	

}
