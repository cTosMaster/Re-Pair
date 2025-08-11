package com.example.asplatform.repairRequest.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.asplatform.auth.service.CustomUserDetails;
import com.example.asplatform.common.enums.StatusGroup;
import com.example.asplatform.common.service.RepairStatusManager;
import com.example.asplatform.repairRequest.dto.requestDTO.ManualStatusChangeRequestDto;
import com.example.asplatform.repairRequest.dto.requestDTO.RepairRequestCreateDto;
import com.example.asplatform.repairRequest.dto.responseDTO.RepairRequestResponseDto;
import com.example.asplatform.repairRequest.service.RepairRequestService;
import com.example.asplatform.user.domain.User;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/repair-requests")
public class RepairRequestController {

	private final RepairRequestService repairRequestService;
	private final RepairStatusManager repairStatusManager;
	
	/**
	 * 수리 요청 등록
	 * @param dto
	 * @return
	 */
	@PostMapping
    public ResponseEntity<Long> createRepairRequest(@RequestBody RepairRequestCreateDto dto, @AuthenticationPrincipal CustomUserDetails principal) {
		
		User user = principal.getUser();
        //User user = TestUserFactory.user();//나중에  @AuthenticationPrincipal 사용
        Long repairRequestId = repairRequestService.createRepairRequest(user, dto);
        return ResponseEntity.ok(repairRequestId);
    }
	
	/**
	 * 수리 요청 조회 - 유저 mypage용
	 * @param user
	 * @param statusGroup
	 * @param page
	 * @param size
	 * @param keyword
	 * @return
	 */
	 @GetMapping("/user-my")
	    public ResponseEntity<Page<RepairRequestResponseDto>> getMyRepairRequests(
	            @AuthenticationPrincipal CustomUserDetails principal, 
	            @RequestParam(value="statusGroup", defaultValue = "IN_PROGRESS") StatusGroup statusGroup,
	            @RequestParam(value="page", defaultValue = "0") int page, //기본값 1페이지부터
	            @RequestParam(value = "size", defaultValue = "15") int size,
	            @RequestParam(value = "keyword", required = false) String keyword
	    ) {
		 	User user = principal.getUser();
		 	log.debug("🔍 userId = {}", user.getId());
	        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
	        Page<RepairRequestResponseDto> result = repairRequestService.getUserRepairRequests(user, statusGroup, keyword, pageable);
	        return ResponseEntity.ok(result);
	    }
	


    /**
     * 수리 상태 수동 변경
     * @param requestId
     * @param request
     * @param user
     * @return
     */
	@PostMapping("/{requestId}/status")
	public ResponseEntity<Void> manuallyUpdateStatus(
	        @PathVariable Long requestId,
	        @RequestBody ManualStatusChangeRequestDto request,
	        @AuthenticationPrincipal CustomUserDetails principal
	) {
		User user = principal.getUser();
		//User user = TestUserFactory.admin();//나중에  @AuthenticationPrincipal 사용
	    repairStatusManager.changeStatus(requestId, request.getTargetStatus(), user, request.getMemo());
	    return ResponseEntity.ok().build();
	}
}
