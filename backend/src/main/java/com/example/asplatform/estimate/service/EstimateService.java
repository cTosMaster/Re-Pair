package com.example.asplatform.estimate.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.asplatform.common.enums.RepairStatus;
import com.example.asplatform.common.enums.Role;
import com.example.asplatform.common.service.RepairStatusManager;
import com.example.asplatform.estimate.domain.Estimate;
import com.example.asplatform.estimate.domain.EstimatePresetUsage;
import com.example.asplatform.estimate.dto.requestDTO.EstimateCreateRequestDto;
import com.example.asplatform.estimate.dto.responseDTO.EstimateCreateResponseDto;
import com.example.asplatform.estimate.dto.responseDTO.EstimateReadResponseDto;
import com.example.asplatform.estimate.dto.responseDTO.EstimateReadResponseDto.PresetBrief;
import com.example.asplatform.estimate.repository.EstimatePresetUsageRepository;
import com.example.asplatform.estimate.repository.EstimateRepository;
import com.example.asplatform.preset.domain.Preset;
import com.example.asplatform.preset.repository.PresetRepository;
import com.example.asplatform.repairRequest.domain.RepairRequest;
import com.example.asplatform.repairRequest.repository.RepairRequestRepository;
import com.example.asplatform.user.domain.User;
import com.example.asplatform.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EstimateService {
	private final RepairRequestRepository repairRequestRepository;
	private final PresetRepository presetRepository;
	private final EstimateRepository estimateRepository;
	private final EstimatePresetUsageRepository usageRepository;
	private final UserRepository userRepository;
	private final RepairStatusManager repairStatusManager;

	
	
	/**
	 * 1차 견적 등록
	 * - 호출자는 엔지니어만(ROLE_ENGINEER)
	 * - 타겟 수리요청은: 본인에게 배정
	 * - 상태=WAITING_FOR_REPAIR && 미삭제
	 * - 한 요청당 1개의 1차 견적만 허용(서비스 가드 + DB UNIQUE)
	 * - 프리셋/수기 금액은 nullable 허용
	 * - 총액(price) = COALESCE(preset_total,0) + COALESCE(manual_amount,0)
	 * - 처리 완료 후 상태 변경: WAITING_FOR_REPAIR -> IN_PROGRESS
	 * 
	 * @param req
	 * @param user
	 * @return
	 */
	@Transactional
	public EstimateCreateResponseDto createFirstEstimate(EstimateCreateRequestDto req, User user) {
		if (user.getRole() != Role.ENGINEER) {
			throw new AccessDeniedException("수리기사만 견적을 작성할 수 있습니다.");
		}

		// 대상 수리요청 검증: 본인 소유 + WAITING_FOR_REPAIR + 미삭제
		RepairRequest target = repairRequestRepository
				.findOwnedWaitingForRepair(req.requestId(), user.getId(), RepairStatus.WAITING_FOR_REPAIR)
				.orElseThrow(() -> new AccessDeniedException("대상 요청이 없거나 권한/상태가 올바르지 않습니다."));
		
	    // 고객사 ID 확보
	    Long customerId = target.getRepairableItem().getCustomer().getId();
	    

		// 중복 방지(UX용 가드) - DB UNIQUE와 중복 방어
		if (estimateRepository.existsByRequestId(req.requestId())) {
			throw new IllegalStateException("이미 1차 견적이 등록되어 있습니다.");
		}

		// 빈 Estimate 생성하여 PK 확보 (usage FK로 사용)
		Estimate estimate = new Estimate();

		User engineerRef = userRepository.getReferenceById(user.getId()); // 프록시로 참조
		estimate.setEngineer(engineerRef);
		estimate.setRequestId(req.requestId());
		estimate.setDescription(req.description());
		estimate.setPresetTotal(null); // nullable 정책
		estimate.setManualAmount(null); // nullable 정책
		estimate.setPrice(0); // 임시
		estimate = estimateRepository.save(estimate);

		// 프리셋 검증/합계 + 사용내역 저장 (unit_price 스냅샷 없음)
		List<Long> presetIds = Optional.ofNullable(req.presetIds()).orElseGet(List::of);
		presetIds = presetIds.stream().distinct().toList(); // 중복 제거
		Integer presetTotal = null;

		if (!presetIds.isEmpty()) {
			// 존재성/개수 검증
			long cnt = presetRepository.countByPresetIdInAndCustomerIdAndIsDeletedFalse(presetIds, customerId);
			if (cnt != presetIds.size()) {
				throw new IllegalArgumentException("선택한 프리셋 중 고객사에 속하지 않거나 존재하지 않는 항목이 있습니다.");
			}

			// 현재 Preset.price 합계 (서버 재계산)
			var presets = presetRepository.findByPresetIdInAndCustomerIdAndIsDeletedFalse(presetIds, customerId);
			int sum = presets.stream().mapToInt(Preset::getPrice).sum();
			presetTotal = sum;

			// 사용내역 기록 (estimate_id, preset_id만)
			var usages = new ArrayList<EstimatePresetUsage>(presetIds.size());
			for (Long pid : presetIds) {
				var u = new EstimatePresetUsage();
				u.setEstimateId(estimate.getEstimateId());
				u.setPresetId(pid);
				usages.add(u);
			}
			usageRepository.saveAll(usages);
		}

		// 수기 금액(nullable 처리)
		Integer manual = (req.manualAmount() == null || req.manualAmount() == 0) ? null : req.manualAmount();

		// 총액 계산
		int total = (presetTotal == null ? 0 : presetTotal) + (manual == null ? 0 : manual);

		estimate.setPresetTotal(presetTotal);
		estimate.setManualAmount(manual);
		estimate.setPrice(total);

		// 상태 자동 변경: WAITING_FOR_REPAIR -> IN_PROGRESS
		repairStatusManager.changeStatus(target.getRequestId(), RepairStatus.IN_PROGRESS, user, null);

		// UNIQUE 제약 위반 등 최종 방어 (동시 요청 경합)
		try {
			// JPA는 트랜잭션 종료 시 flush되지만, 명시적 예외 변환을 위해 한번 더 접근 유도
			estimateRepository.flush();
		} catch (DataIntegrityViolationException e) {
			// uq_estimates_request 위반 시
			throw new IllegalStateException("이미 1차 견적이 등록되었습니다.", e);
		}

		return new EstimateCreateResponseDto(estimate.getEstimateId(), req.requestId(),
				presetTotal == null ? 0 : presetTotal, manual == null ? 0 : manual, total, presetIds.size(),
				RepairStatus.IN_PROGRESS.name());
	}

	/**
	 * 수리요청의 1차 견적 단건 조회
	 * 
	 * @param requestId
	 * @return
	 */
	@Transactional(readOnly = true)
	public EstimateReadResponseDto getFirstEstimate(Long requestId) {
		Estimate est = estimateRepository.findByRequestId(requestId)
				.orElseThrow(() -> new NoSuchElementException("1차 견적이 존재하지 않습니다."));

		
	    // requestId로 수리요청 가져와서 customerId 확보(연관에 맞게 선택)
	    RepairRequest target = repairRequestRepository.findById(est.getRequestId())
	            .orElseThrow(() -> new NoSuchElementException("대상 수리요청을 찾을 수 없습니다."));
	    Long customerId = target.getRepairableItem().getCustomer().getId();
		
		// 선택 프리셋 조회
		List<EstimatePresetUsage> usages = usageRepository.findByEstimateId(est.getEstimateId());
		usages.sort(Comparator.comparingLong(EstimatePresetUsage::getUsageId));
		List<Long> presetIds = usages.stream().map(EstimatePresetUsage::getPresetId).toList();

		// 프리셋 이름 매핑 
	    List<PresetBrief> presetBriefs = List.of();
	    if (!presetIds.isEmpty()) {
	        List<Preset> presets = presetRepository
	                .findByPresetIdInAndCustomerIdAndIsDeletedFalse(presetIds, customerId);

	        Map<Long, String> nameMap = new HashMap<>();
	        for (Preset p : presets) {
	            nameMap.put(p.getPresetId(), p.getName());
	        }

	        // 사용내역 순서대로 반환, 누락되면 "(삭제됨)" 표시
	        presetBriefs = usages.stream()
	                .map(u -> new PresetBrief(
	                        u.getPresetId(),
	                        nameMap.getOrDefault(u.getPresetId(), "(삭제됨/권한외)")
	                ))
	                .toList();
	    }

		int presetTotal = est.getPresetTotal() == null ? 0 : est.getPresetTotal();
		int manualAmt = est.getManualAmount() == null ? 0 : est.getManualAmount();

		return new EstimateReadResponseDto(est.getEstimateId(), est.getRequestId(), presetTotal, manualAmt,
				est.getPrice(), est.getDescription(), est.getCreatedAt(), presetIds.size(), presetBriefs);
	}

}
