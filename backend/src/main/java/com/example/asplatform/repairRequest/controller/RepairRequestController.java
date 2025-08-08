package com.example.asplatform.repairRequest.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.asplatform.auth.service.CustomUserDetails;
import com.example.asplatform.common.service.RepairStatusManager;
import com.example.asplatform.common.testutil.TestUserFactory;
import com.example.asplatform.repairRequest.dto.requestDTO.ManualStatusChangeRequestDto;
import com.example.asplatform.repairRequest.dto.requestDTO.RepairRequestCreateDto;
import com.example.asplatform.repairRequest.service.RepairRequestService;
import com.example.asplatform.user.domain.User;

import lombok.RequiredArgsConstructor;

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
