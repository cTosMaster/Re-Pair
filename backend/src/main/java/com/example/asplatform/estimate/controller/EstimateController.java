package com.example.asplatform.estimate.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.asplatform.auth.service.CustomUserDetails;
import com.example.asplatform.estimate.dto.requestDTO.EstimateCreateRequestDto;
import com.example.asplatform.estimate.dto.responseDTO.EstimateCreateResponseDto;
import com.example.asplatform.estimate.dto.responseDTO.EstimateReadResponseDto;
import com.example.asplatform.estimate.service.EstimateService;
import com.example.asplatform.user.domain.User;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/repair-estimates")
@RequiredArgsConstructor
public class EstimateController {

	private final EstimateService estimateService;

	/**
	 * 1차 견적 등록 - ROLE_ENGINEER 만 접근 - Content-Type: application/json
	 * 
	 * @param dto
	 * @param principal
	 * @return
	 */
	@PostMapping(value = "/first", consumes = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasRole('ENGINEER')")
	public ResponseEntity<EstimateCreateResponseDto> createFirst(@Valid @RequestBody EstimateCreateRequestDto dto,
			@AuthenticationPrincipal CustomUserDetails principal) {
		User user = principal.getUser();
		var res = estimateService.createFirstEstimate(dto, user);
		return ResponseEntity.ok(res);
	}

	/**
	 * 수리요청 상세 페이지에서 1차 견적 조회 - 로그인 사용자 누구나 접근
	 * 
	 * @param requestId
	 * @return
	 */
	@GetMapping("/first/{requestId}")
	public ResponseEntity<EstimateReadResponseDto> getFirstEstimate(@PathVariable Long requestId) {
		var res = estimateService.getFirstEstimate(requestId);
		return ResponseEntity.ok(res);
	}

}
