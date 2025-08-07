package com.example.asplatform.repairRequest.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.asplatform.common.service.RepairStatusManager;
import com.example.asplatform.repair.dto.requestDTO.ManualStatusChangeRequestDto;
import com.example.asplatform.user.domain.User;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/repair-requests")
public class RepairRequestController {

	
	private final RepairStatusManager repairStatusManager;

	
	@PostMapping("/{requestId}/cancel")
	public ResponseEntity<Void> manuallyUpdateStatus(
	        @PathVariable Long requestId,
	        @RequestBody ManualStatusChangeRequestDto request,
	        @AuthenticationPrincipal User user
	) {
	    repairStatusManager.changeStatus(requestId, request.getTargetStatus(), user, request.getMemo());
	    return ResponseEntity.ok().build();
	}
}
