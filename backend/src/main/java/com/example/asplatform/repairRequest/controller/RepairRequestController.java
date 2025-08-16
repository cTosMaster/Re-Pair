package com.example.asplatform.repairRequest.controller;

import com.example.asplatform.engineer.repository.EngineerRepository;
import com.example.asplatform.repairRequest.dto.responseDTO.RepairRequestSimpleResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.example.asplatform.auth.service.CustomUserDetails;
import com.example.asplatform.common.enums.RepairStatus;
import com.example.asplatform.common.enums.StatusGroup;
import com.example.asplatform.common.service.RepairStatusManager;
import com.example.asplatform.repairRequest.dto.requestDTO.ManualStatusChangeRequestDto;
import com.example.asplatform.repairRequest.dto.requestDTO.RepairRequestCreateDto;
import com.example.asplatform.repairRequest.dto.responseDTO.CustomerRepairRequestListDto;
import com.example.asplatform.repairRequest.dto.responseDTO.RepairRequestListDto;
import com.example.asplatform.repairRequest.service.RepairRequestService;
import com.example.asplatform.user.domain.User;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;

import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/repair-requests")
public class RepairRequestController {

	private final RepairRequestService repairRequestService;
	private final RepairStatusManager repairStatusManager;
	private final EngineerRepository engineerRepository;

	/**
	 * 수리 요청 등록
	 * 
	 * @param dto
	 * @return
	 */
	@PostMapping
	public ResponseEntity<Long> createRepairRequest(@RequestBody RepairRequestCreateDto dto,
			@AuthenticationPrincipal CustomUserDetails principal) {

		User user = principal.getUser();
		// User user = TestUserFactory.user();//나중에 @AuthenticationPrincipal 사용
		Long repairRequestId = repairRequestService.createRepairRequest(user, dto);
		return ResponseEntity.ok(repairRequestId);
	}

	/**
	 * 수리 요청 조회 - 유저 mypage용
	 * 
	 * @param principal
	 * @param statusGroup
	 * @param page
	 * @param size
	 * @param keyword
	 * @return
	 */
	@GetMapping("/user-my")
	public ResponseEntity<Page<RepairRequestListDto>> getUserRepairRequests(
			@AuthenticationPrincipal CustomUserDetails principal,
			@RequestParam(value = "statusGroup", defaultValue = "IN_PROGRESS") StatusGroup statusGroup,
			@RequestParam(value = "page", defaultValue = "0") int page, // 기본값 1페이지부터
			@RequestParam(value = "size", defaultValue = "15") int size,
			@RequestParam(value = "keyword", required = false) String keyword) {
		User user = principal.getUser();
		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
		Page<RepairRequestListDto> result = repairRequestService.getUserRepairRequests(user, statusGroup, keyword,
				pageable);
		return ResponseEntity.ok(result);
	}

	// GET /api/repair-requests/engineer-my?page=0&size=20&keyword=

	/**
	 * 수리 요청 조회 - 수리기사 mypage용
	 * 
	 * @param principal
	 * @param page
	 * @param size
	 * @param keyword
	 * @return
	 */
	@GetMapping("/engineer-my")
	@PreAuthorize("hasRole('ENGINEER')")
	public ResponseEntity<Page<RepairRequestListDto>> getEngineerRequestList(
			@AuthenticationPrincipal CustomUserDetails principal, @RequestParam(required = false) RepairStatus status, @RequestParam(required = false) Long categoryId,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
			@RequestParam(required = false) String keyword) {
		User user = principal.getUser();

		Page<RepairRequestListDto> result = repairRequestService.getEngineerRequestList(user, status, categoryId, keyword, page,
				size);

		return ResponseEntity.ok(result);
	}

	/**
	 * 수리 요청 조회 - 고객사 mypage용
	 * 
	 * @param principal
	 * @param keyword
	 * @param category
	 * @param status
	 * @param pageable
	 * @return
	 */
	@GetMapping("/customer-my")
	@PreAuthorize("hasRole('CUSTOMER')")
	public Page<CustomerRepairRequestListDto> getCustomerRequestList(
			@AuthenticationPrincipal CustomUserDetails principal, @RequestParam(required = false) String keyword, // 고객명/제목
			@RequestParam(required = false) Long categoryId, @RequestParam(required = false) RepairStatus status, // 잘못된
																												// 값이면
																												// 400
			@PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

		Long customerId = principal.getUser().getCustomer().getId();
		if (customerId == null) {
			throw new org.springframework.web.server.ResponseStatusException(
					org.springframework.http.HttpStatus.FORBIDDEN, "고객사 관리자 계정이 아닙니다.");
		}
		return repairRequestService.getCustomerRequestList(customerId, keyword, categoryId, status, pageable);
	}

	/**
	 * 수리 상태 수동 변경
	 * 
	 * @param requestId
	 * @param request
	 * @param user
	 * @return
	 */
	@PostMapping("/{requestId}/status")
	public ResponseEntity<Void> manuallyUpdateStatus(@PathVariable Long requestId,
			@RequestBody ManualStatusChangeRequestDto request, @AuthenticationPrincipal CustomUserDetails principal) {
		User user = principal.getUser();
		// User user = TestUserFactory.admin();//나중에 @AuthenticationPrincipal 사용
		repairStatusManager.changeStatus(requestId, request.getTargetStatus(), user, request.getMemo());
		return ResponseEntity.ok().build();
	}

	// 수리기사의 경우 engineer배정해야함. 수리기사의 경우 자동 배정
	@PatchMapping("/{requestId}/accept")
	@PreAuthorize("hasAnyRole('CUSTOMER','ENGINEER')")
	public ResponseEntity<RepairRequestSimpleResponse> accept(
			@PathVariable("requestId") Long requestId,
			@AuthenticationPrincipal CustomUserDetails me,
			@RequestParam(required = false) Long engineerId,
			@RequestParam(required = false) String memo
	) {
		return ResponseEntity.ok(
				repairRequestService.accept(requestId, me.getUser(), engineerId, memo)
		);
	}

	// 관리자,수리기사 수리요청 거절/ reason 필요함
	@PatchMapping("/{requestId}/reject")
	@PreAuthorize("hasAnyRole('CUSTOMER','ENGINEER')")
	public ResponseEntity<RepairRequestSimpleResponse> reject(
			@PathVariable("requestId") Long requestId,
			@AuthenticationPrincipal CustomUserDetails me,
			@RequestBody(required = false) java.util.Map<String,String> body
	) {
		String reason = body != null ? body.get("reason") : null;
		return ResponseEntity.ok(
				repairRequestService.reject(requestId, me.getUser(), reason)
		);
	}

	// 수리기사만 waiting_for_repair -> in_progress
	@PatchMapping("/{requestId}/start")
	@PreAuthorize("hasRole('ENGINEER')")
	public ResponseEntity<RepairRequestSimpleResponse> start(
			@PathVariable("requestId") Long requestId,
			@AuthenticationPrincipal CustomUserDetails me
	) {
		return ResponseEntity.ok(repairRequestService.startWork(requestId, me.getUser()));
	}



	// RepairRequestCommandController.java
	// 완료 버튼
	@PatchMapping("/{requestId}/complete-for-test")
@PreAuthorize("hasAnyAuthority('ROLE_ENGINEER','ROLE_CUSTOMER'") // 또는 hasAnyRole('ROLE_ENGINEER','ROLE_CUSTOMER')
public ResponseEntity<RepairRequestSimpleResponse> completeTest(
    @PathVariable Long requestId,
    @AuthenticationPrincipal CustomUserDetails me,
    @RequestParam(value = "memo", required = false) String memoParam,
    @RequestBody(required = false) Map<String, Object> body
) {
    String memo = (memoParam != null && !memoParam.isBlank())
            ? memoParam
            : (body != null && body.get("memo") != null ? String.valueOf(body.get("memo")) : null);

    return ResponseEntity.ok(
        repairRequestService.completeForTest(requestId, me.getUser(), memo)
    );
}

}
