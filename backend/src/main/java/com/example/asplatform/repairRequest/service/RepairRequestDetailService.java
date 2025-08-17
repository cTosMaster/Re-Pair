package com.example.asplatform.repairRequest.service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.asplatform.common.enums.RepairStatus;
import com.example.asplatform.common.enums.Role;
import com.example.asplatform.customer.domain.Customer;
import com.example.asplatform.estimate.domain.Estimate;
import com.example.asplatform.estimate.domain.EstimatePresetUsage;
import com.example.asplatform.estimate.dto.responseDTO.EstimateReadResponseDto;
import com.example.asplatform.estimate.repository.EstimatePresetUsageRepository;
import com.example.asplatform.estimate.repository.EstimateRepository;
import com.example.asplatform.preset.domain.Preset;
import com.example.asplatform.preset.repository.PresetRepository;
import com.example.asplatform.repairHistory.domain.RepairHistory;
import com.example.asplatform.repairHistory.repository.RepairHistoryRepository;
import com.example.asplatform.repairRequest.domain.RepairRequest;
import com.example.asplatform.repairRequest.dto.responseDTO.RepairRequestDetailResponseDto;
import com.example.asplatform.repairRequest.dto.responseDTO.RepairRequestDetailResponseDto.Actions;
import com.example.asplatform.repairRequest.dto.responseDTO.RepairRequestDetailResponseDto.FinalEstimateInfo;
import com.example.asplatform.repairRequest.dto.responseDTO.RepairRequestDetailResponseDto.HistoryRow;
import com.example.asplatform.repairRequest.dto.responseDTO.RepairRequestDetailResponseDto.RequestInfo;
import com.example.asplatform.repairRequest.dto.responseDTO.RepairRequestDetailResponseDto.SimpleRef;
import com.example.asplatform.repairRequest.dto.responseDTO.RepairRequestDetailResponseDto.SimpleUser;
import com.example.asplatform.repairRequest.dto.responseDTO.RepairRequestDetailResponseDto.StageInfo;
import com.example.asplatform.repairRequest.dto.responseDTO.RepairRequestDetailResponseDto.StatusInfo;
import com.example.asplatform.repairRequest.repository.RepairRequestRepository;
import com.example.asplatform.user.domain.User;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RepairRequestDetailService {

	private final RepairRequestRepository repairRequestRepository;
	private final RepairHistoryRepository historyRepository;
	private final EstimateRepository estimateRepository;
	private final EstimatePresetUsageRepository usageRepository;
	private final PresetRepository presetRepository;

	/**
	 * 상세 조회(읽기 전용)
	 */
	@Transactional(readOnly = true)
	public RepairRequestDetailResponseDto getDetail(Long requestId, User me) {
		// 1) 요청 + 연관 로딩(FETCH JOIN)
		RepairRequest rr = repairRequestRepository.findByIdWithAllRelations(requestId)
				.orElseThrow(() -> new EntityNotFoundException("repair request not found: " + requestId));

		// 2) 접근 권한 검사 (작성자/배정기사/같은 고객사 관리자/ADMIN)
		if (!canView(rr, me))
			throw new AccessDeniedException("no permission");

		// 3) 기본 정보 매핑 + 전화번호 하이픈 포맷
		RequestInfo req = mapRequestInfo(rr);

		// 4) 상태 이력 조회(오름차순) + 상태 블록 구성(라벨/스텝/히스토리/최근사유요약)
		List<RepairHistory> his = historyRepository.findByRepairRequestOrderByChangedAtAsc(rr);
		Map<String, String> lastReasons = buildLastReasons(his);
		StatusInfo status = mapStatus(rr.getStatus(), his, lastReasons);

		// 5) 1차 견적(있으면 모두 열람 가능 정책) — 기존 레포/서비스 로직 재사용
		Optional<Estimate> estOpt = estimateRepository.findByRequestId(requestId);
		EstimateReadResponseDto estimateDto = mapEstimate(estOpt, requestId);

		// 6) 최종 견적 -미완 (exists=false)
		FinalEstimateInfo finalEstimate = FinalEstimateInfo.builder().exists(false).build();

		// 7) 단계 클릭 가능 여부(현재 단계까지만 가능)
		List<StageInfo> stages = buildStages(rr.getStatus());

		// 8) 현재 사용자 액션 권한 플래그
		Actions actions = computeActions(rr, me);

		// 9) 상황 안내문
		String notice = computeNotice(rr, me);

		// 10) 응답
		return RepairRequestDetailResponseDto.builder().request(req).status(status).estimate(estimateDto)
				.finalEstimate(finalEstimate).stages(stages).actions(actions).notice(notice).build();
	}

	// ---------- 권한/정책 ----------

	private Long extractCustomerId(RepairRequest rr) {
		// 우선 순위 1: 아이템의 고객사
		if (rr.getRepairableItem() != null && rr.getRepairableItem().getCustomer() != null)
			return rr.getRepairableItem().getCustomer().getId();
		// 우선 순위 2: 작성자(고객의)의 소속 고객사
		if (rr.getUser() != null && rr.getUser().getCustomer() != null)
			return rr.getUser().getCustomer().getId();
		return null;
	}

	private boolean isSameCustomerManager(User me, RepairRequest rr) {
		if (me.getRole() != Role.CUSTOMER)
			return false; // 고객사 관리자
		Long rrCustomerId = extractCustomerId(rr);
		Long meCustomerId = me.getCustomer() != null ? me.getCustomer().getId() : null;
		return rrCustomerId != null && meCustomerId != null && rrCustomerId.equals(meCustomerId);
	}

	private boolean canView(RepairRequest rr, User me) {
		boolean isRequester = rr.getUser() != null && rr.getUser().getId().equals(me.getId()); // 작성자
		boolean isEngineer = rr.getEngineer() != null && rr.getEngineer().getId().equals(me.getId());
		boolean sameCustomer = isSameCustomerManager(me, rr);
		boolean admin = me.getRole() == Role.ADMIN;
		return isRequester || isEngineer || sameCustomer || admin;
	}

	private Actions computeActions(RepairRequest rr, User me) {
		RepairStatus st = rr.getStatus();
		// --- 역할/소속 판별 (null-safe) ---
		boolean isEngineer = rr.getEngineer() != null && rr.getEngineer().getId().equals(me.getId());
		boolean isRequester = rr.getUser() != null && rr.getUser().getId().equals(me.getId()); // 작성자(고객)
		Long rrCustomerId = (rr.getRepairableItem() != null && rr.getRepairableItem().getCustomer() != null)
				? rr.getRepairableItem().getCustomer().getId()
				: (rr.getUser() != null && rr.getUser().getCustomer() != null ? rr.getUser().getCustomer().getId()
						: null);

		Long meCustomerId = (me.getCustomer() != null) ? me.getCustomer().getId() : null;

		boolean isCustomerManager = me.getRole() == Role.CUSTOMER && rrCustomerId != null && meCustomerId != null
				&& rrCustomerId.equals(meCustomerId); // 고객사 관리자(같은 고객사)

		boolean isAdmin = me.getRole() == Role.ADMIN; // 플랫폼 관리자

		return Actions.builder().canApprove(isCustomerManager && st == RepairStatus.PENDING)
				// 접수 대기: 고객사 관리자 권한
				.canApprove(isCustomerManager && st == RepairStatus.PENDING)
				.canAssignEngineer(
						isCustomerManager && (st == RepairStatus.PENDING || st == RepairStatus.WAITING_FOR_REPAIR))

				// 수리 대기: 기사만 1차 견적 작성/수정
				.canCreateEstimate(isEngineer && st == RepairStatus.WAITING_FOR_REPAIR)
				.canEditEstimate(isEngineer && st == RepairStatus.WAITING_FOR_REPAIR)

				// 수리 중부터 1차 견적은 모두 열람
				.canViewEstimate(st.ordinal() >= RepairStatus.IN_PROGRESS.ordinal())

				// 수동 상태 변경/취소
				.canManualChange(isCustomerManager || isEngineer).canManualCancel(isCustomerManager || isAdmin)

				// 결제/리뷰
				.canPay(isRequester && st == RepairStatus.WAITING_FOR_PAYMENT)
				.canWriteReview(isRequester && st == RepairStatus.COMPLETED)

				// 최종 견적(아직 미완)
				.canCreateFinalEstimate(isEngineer && st == RepairStatus.IN_PROGRESS)
				.canViewFinalEstimate(st.ordinal() >= RepairStatus.WAITING_FOR_PAYMENT.ordinal())

				.build();
	}

	private String computeNotice(RepairRequest rr, User me) {
		if (rr.getStatus() == RepairStatus.WAITING_FOR_REPAIR && isCustomerWriter(me, rr)) {
			return "수리기사와의 유선 상담을 토대로 현재 고객님 물품의 1차 견적을 작성 중입니다.";
		}
		if (rr.getStatus() == RepairStatus.WAITING_FOR_DELIVERY) {
			return "이용해주셔서 감사합니다. 발송 대기 상태입니다.";
		}
		return null;
	}

	private boolean isCustomerWriter(User me, RepairRequest rr) {
		return rr.getUser().getId().equals(me.getId());
	}

	// ---------- 단계/라벨 ----------

	private List<StageInfo> buildStages(RepairStatus status) {
		List<RepairStatus> order = List.of(RepairStatus.PENDING, 
				RepairStatus.WAITING_FOR_REPAIR, 
				RepairStatus.IN_PROGRESS, 
				RepairStatus.WAITING_FOR_PAYMENT, 
				RepairStatus.WAITING_FOR_DELIVERY, 
				RepairStatus.COMPLETED
		);
		int idx = order.indexOf(status);
		return order.stream()
				.map(s -> StageInfo.builder().code(s.name()).label(toKorean(s)).clickable(order.indexOf(s) <= idx).build())
				.toList(); // 현재 단계까지 클릭가능
	}

	private String toKorean(RepairStatus s) {
		return switch (s) {
		case PENDING -> "접수 대기";
		case WAITING_FOR_REPAIR -> "수리 대기";
		case IN_PROGRESS -> "수리 중";
		case WAITING_FOR_PAYMENT -> "결제 대기";
		case WAITING_FOR_DELIVERY -> "발송 대기";
		case COMPLETED -> "발송 완료";
		case CANCELED -> "취소";
		default -> s.name();
		};
	}

	// ---------- 매핑(엔티티 → DTO) ----------

	private RequestInfo mapRequestInfo(RepairRequest rr) {
		return RequestInfo.builder().id(rr.getRequestId()).title(rr.getTitle()).content(rr.getDescription())
				.createdAt(rr.getCreatedAt()).phone(formatPhone(rr.getContactPhone()))
				.postalCode(rr.getUser().getAddress().getPostalCode())
				.roadAddress(rr.getUser().getAddress().getRoadAddress())
				.category(new SimpleRef(rr.getRepairableItem().getCategory().getId(),
						rr.getRepairableItem().getCategory().getName()))
				.item(new SimpleRef(rr.getRepairableItem().getItemId(), rr.getRepairableItem().getName()))
				.customer(new SimpleRef(rr.getRepairableItem().getCustomer().getId(),
						rr.getRepairableItem().getCustomer().getCompanyName()))
				.writer(new SimpleUser(rr.getUser().getId(), rr.getUser().getName(), rr.getUser().getEmail()))
				.engineer(rr.getEngineer() == null ? null
						: new SimpleUser(rr.getEngineer().getId(), rr.getEngineer().getName(),
								rr.getEngineer().getEmail()))
				.build();
	}

	private StatusInfo mapStatus(RepairStatus now, List<RepairHistory> his, Map<String, String> lastReasons) {
		List<HistoryRow> rows = his.stream()
				.map(h -> new HistoryRow(h.getPreviousStatus().getLabel(), h.getNewStatus().getLabel(), h.getMemo(),
						formatChangedBy(h), // "김수리(ENGINEER)" 등
						h.getChangedAt(), null))
				.toList();

		int stepIndex = switch (now) {
		case PENDING -> 0;
		case WAITING_FOR_REPAIR -> 1;
		case IN_PROGRESS -> 2;
		case WAITING_FOR_PAYMENT -> 3;
		case WAITING_FOR_DELIVERY -> 4;
		case COMPLETED -> 5;
		default -> 0;
		};

		return StatusInfo.builder().code(now.name()).label(toKorean(now)).stepIndex(stepIndex).history(rows)
				.lastReasons(lastReasons) // {rejection, hold, cancel}
				.build();
	}

	private String formatChangedBy(RepairHistory h) {
		return h.getChangedBy().getName() != null ? h.getChangedBy().getName() : "UNKNOWN";
	}

	private EstimateReadResponseDto mapEstimate(Optional<Estimate> estOpt, Long requestIdForFetchJoin) {
		if (estOpt.isEmpty())
			return null;

		Estimate est = estOpt.get();

		// 1) 수리요청 -> 고객사 ID 확보 (아이템의 고객사 우선)
		RepairRequest rr = repairRequestRepository.findByIdWithItemAndCustomer(requestIdForFetchJoin)
				.orElseThrow(() -> new NoSuchElementException("대상 수리요청을 찾을 수 없습니다."));

		Long customerId = Optional.ofNullable(rr.getRepairableItem()).map(ri -> ri.getCustomer()).map(Customer::getId)
				.orElseThrow(() -> new IllegalStateException("수리요청에 고객사 정보가 없습니다."));

		// 2) 사용 프리셋 사용내역 조회(순서 보존)
		List<EstimatePresetUsage> usages = usageRepository.findByEstimateId(est.getEstimateId());
		usages.sort(Comparator.comparingLong(EstimatePresetUsage::getUsageId));

		List<Long> presetIds = usages.stream().map(EstimatePresetUsage::getPresetId).toList();

		// 3) 고객사 프리셋 마스터 로드 (소프트딜리트 제외)
		Map<Long, Preset> presetMap;
		if (presetIds.isEmpty()) {
			presetMap = Map.of();
		} else {
			List<Preset> presets = presetRepository.findByPresetIdInAndCustomerIdAndIsDeletedFalse(presetIds,
					customerId);
			presetMap = presets.stream().collect(Collectors.toMap(Preset::getPresetId, Function.identity()));
		}

		// 4) 사용내역 순서대로 프리셋 요약 생성
		List<EstimateReadResponseDto.PresetBrief> presetBriefs = usages.stream().map(u -> {
			Preset p = presetMap.get(u.getPresetId());
			if (p == null) {
				return new EstimateReadResponseDto.PresetBrief(u.getPresetId(), "(삭제됨/권한외)", 0);
			}
			return new EstimateReadResponseDto.PresetBrief(p.getPresetId(), p.getName(), p.getPrice());
		}).toList();

		// 5) 금액/카운트 파생 + 작성자
		int presetTotal = est.getPresetTotal() != null ? est.getPresetTotal() : 0;
		int manualAmount = est.getManualAmount() != null ? est.getManualAmount() : 0;
		int usedPresetCount = presetIds.size();

		// 6) DTO 반환
		return new EstimateReadResponseDto(est.getEstimateId(), est.getRequestId(), presetTotal, manualAmount,
				est.getPrice(), // totalPrice: 저장된 값 그대로
				est.getDescription(), est.getCreatedAt(), usedPresetCount, presetBriefs);
	}

	/**
	 * 최근 사유 요약 계산 사유 - cancel: 최근 취소 사유 - COMPLETED: 최근 배송 완료 사유
	 */
	private Map<String, String> buildLastReasons(List<RepairHistory> history) {
		// 최신순 정렬
		List<RepairHistory> desc = history.stream().sorted(Comparator.comparing(RepairHistory::getChangedAt).reversed())
				.toList();

		// 최근 취소 사유 (COMPLETED로 넘어간 경우는 제외)
		String cancel = desc.stream()
				.filter(h -> h.getNewStatus() == RepairStatus.CANCELED
						&& h.getPreviousStatus() != RepairStatus.COMPLETED
						&& h.getPreviousStatus() != RepairStatus.WAITING_FOR_DELIVERY) // 배송완료, 발송대기에서 취소 불가
				.map(RepairHistory::getMemo).filter(Objects::nonNull).findFirst().orElse(null);

		// 최근 배송 완료 사유
		String completed = desc.stream().filter(h -> h.getNewStatus() == RepairStatus.COMPLETED)
				.map(RepairHistory::getMemo).filter(Objects::nonNull).findFirst().orElse(null);

		Map<String, String> map = new HashMap<>();
		map.put("cancel", cancel);
		map.put("completed", completed);
		return map;
	}

	// ---------- 유틸 ----------

	/** 숫자만 들어왔을 때 하이픈 삽입: 01012345678 → 010-1234-5678 */
	private String formatPhone(String raw) {
		if (raw == null)
			return null;
		String digits = raw.replaceAll("\\D", "");
		if (digits.length() == 11) {
			return digits.substring(0, 3) + "-" + digits.substring(3, 7) + "-" + digits.substring(7);
		} else if (digits.length() == 10) {
			return digits.substring(0, 3) + "-" + digits.substring(3, 6) + "-" + digits.substring(6);
		}
		return raw; // 포맷 불가시 원문 유지
	}
	

}
