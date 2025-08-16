package com.example.asplatform.repairRequest.dto.responseDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.example.asplatform.estimate.dto.responseDTO.EstimateReadResponseDto;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
public class RepairRequestDetailResponseDto {
	private StatusInfo status; // 현재 상태 + 히스토리 + 최근 사유 요약
	private List<StageInfo> stages; // 단계별 클릭 가능 여부
	private RequestInfo request; // 기본 정보(작성자/고객사/품목 등)
	private EstimateReadResponseDto estimate;
	private FinalEstimateInfo finalEstimate; // 최종 견적(지금은 자리만)
	private Actions actions; // 현재 사용자에게 허용된 액션 플래그
	private String notice; // 상황 안내문(선택)
	
	
	@Getter
	@Builder
	@AllArgsConstructor
	@NoArgsConstructor
	public static class RequestInfo {
		private Long id;
		private String title;
		private String content;
		private LocalDateTime createdAt;
		private String phone; // "010-1234-5678" 형태로 서버에서 포맷
		private String postalCode; // 우편 번호
		private String roadAddress;
		private String detailAddress;
		private SimpleRef category; // {id, name}
		private SimpleRef item; // {id, name}
		private SimpleRef customer; // {id, name}
		private SimpleUser writer; // 작성자(고객)
		private SimpleUser engineer;// 배정된 수리기사(없으면 null)
	}

	/** 상태 + 히스토리 + 최근 사유 요약 */
	@Getter
	@Builder
	@AllArgsConstructor
	@NoArgsConstructor
	public static class StatusInfo {
		private String code; // RepairStatus.name()
		private String label; // 한글 라벨
		private int stepIndex; // 단계 인덱스(프론트 하이라이트용)
		private List<HistoryRow> history; // 상태 이력(사유는 memo에)
		private Map<String, String> lastReasons; // {rejection, hold, cancel}
	}


	/** 최종 견적(지금은 placeholder) */
	@Getter
	@Builder
	@AllArgsConstructor
	@NoArgsConstructor
	public static class FinalEstimateInfo {
		private boolean exists; // 지금은 항상 false
		private Long id; // 구현 후 채움
		private Integer total; // 구현 후 채움
	    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
		private LocalDateTime createdAt;
		private SimpleUser createdBy;
	}

	/** 단계별 클릭 가능 여부 */
	@Getter
	@Builder
	@AllArgsConstructor
	@NoArgsConstructor
	public static class StageInfo {
		private String code; // 단계 코드
		private String label; // 단계 라벨
		private boolean clickable; // 현재 사용자에게 열람 가능한지(현재 단계까지 true)
	}

	/** 현재 사용자 권한 플래그 */
	@Getter
	@Builder
	@AllArgsConstructor
	@NoArgsConstructor
	public static class Actions {
		private boolean canApprove; // 관리자: 접수대기 승인
		private boolean canAssignEngineer; // 관리자: 기사 배정/재배정
		private boolean canCreateEstimate; // 기사: 수리대기에서 1차견적 작성
		private boolean canViewEstimate; // 모두: 정책에 따라 열람
		private boolean canEditEstimate; // 기사: 수리대기에서만 수정
		private boolean canManualChange; // 관리자/기사: 허용 정책에 따라 수동 상태변경
		private boolean canManualCancel; // 관리자: 수동 취소 (memo 필수)
		private boolean canPay; // 고객: 결제대기에서 결제
		private boolean canWriteReview; // 고객: 발송 완료 후 리뷰 작성
		private boolean canCreateFinalEstimate; // 기사: 수리중에서 최종견적 작성(자리만)
		private boolean canViewFinalEstimate; // 결제대기부터 조회 가능(자리만)
	}

	/** 공용 미니 DTO들 */
	@Getter
	@Builder
	@AllArgsConstructor
	@NoArgsConstructor
	public static class SimpleRef {
		private Long id;
		private String name;
	}

	@Getter
	@Builder
	@AllArgsConstructor
	@NoArgsConstructor
	public static class SimpleUser {
		private Long id;
		private String name;
		private String email;
	}

	@Getter
	@Builder
	@AllArgsConstructor
	@NoArgsConstructor
	public static class EstimateLine {
		private String name;
		private int qty;
		private int unitPrice;
		private int subtotal;
	}

	@Getter
	@Builder
	@AllArgsConstructor
	@NoArgsConstructor
	public static class HistoryRow {
		private String from; // 이전 상태 코드
		private String to; // 변경 후 상태 코드
		private String memo; // 사유/메모(필수)
		private String changedBy; // 변경자 표시명(역할 포함 가능)
	    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
		private LocalDateTime changedAt; // 변경 일시
		private String mode; // MANUAL / AUTO 등(옵션)
	}
}

