package com.example.asplatform.repair.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.asplatform.auth.service.CustomUserDetails;
import com.example.asplatform.repair.dto.responseDTO.FinalEstimateResponseDto;
import com.example.asplatform.repair.requestDto.FinalEstimateRequestDto;
import com.example.asplatform.repair.service.FinalEstimateService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/repair")
@RequiredArgsConstructor
public class FinalEstimateController {
	
	private final FinalEstimateService repairService;
	
	/**
	 * ✅ 1. 최종 견적서 등록하기
	 * @param user
	 * @param requestId
	 * @param dto
	 * @return
	 */
	@PostMapping("/{reuqestId}/final-estimate") 
	public ResponseEntity<FinalEstimateResponseDto> createFinalEstimate(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long requestId , @RequestBody FinalEstimateRequestDto dto){
		FinalEstimateResponseDto response = repairService.createFinalEstimate(requestId, dto, user);
		return ResponseEntity.ok(response);
	}
	
	/**
	 * ✅ 2. 최종 견적서 수정하기 
	 * @param user
	 * @param repairsId
	 * @param dto
	 * @return
	 */
	@PutMapping("/{repairsId}/final-estimate")
	public ResponseEntity<FinalEstimateResponseDto> updateFInalEstimate(@AuthenticationPrincipal CustomUserDetails user , @PathVariable Long repairsId , @RequestBody FinalEstimateRequestDto dto){
		FinalEstimateResponseDto response = repairService.updateFinalEstimate(repairsId, dto, user);
		return ResponseEntity.ok(response);
	}
	
	/**
	 * ✅ 3. 최종 견적서 조회하기
	 * @param repairId
	 * @return
	 */
	@GetMapping("/{repairId}/final-estimate")
	public ResponseEntity<FinalEstimateResponseDto> getFinalEstimate(@AuthenticationPrincipal CustomUserDetails user , @PathVariable Long repairId){
		FinalEstimateResponseDto response = repairService.getFinalEstimate(repairId, user);
		return ResponseEntity.ok(response);
	}
	
	/**
	 * ✅ 4. 전체 조회하기 
	 * @param user
	 * @param page
	 * @return
	 */
	@GetMapping("/final-estimates")
	public ResponseEntity<?> getAllFinalEstimates( @AuthenticationPrincipal CustomUserDetails user , @RequestParam (value = "page" , defaultValue = "0") int page) {
		return ResponseEntity.ok(repairService.getAllFinalEstimates(page, user));
	}

}
