package com.example.asplatform.repairRequest.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.example.asplatform.engineer.repository.EngineerRepository;
import com.example.asplatform.repairRequest.dto.responseDTO.RepairRequestSimpleResponse;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.ApplicationEventPublisher;

import com.example.asplatform.common.enums.RepairStatus;
import com.example.asplatform.common.enums.Role;
import com.example.asplatform.common.enums.StatusGroup;
import com.example.asplatform.item.domain.RepairableItem;
import com.example.asplatform.item.repository.RepairableItemRepository;
import com.example.asplatform.repairHistory.domain.RepairHistory;
import com.example.asplatform.repairHistory.repository.RepairHistoryRepository;
import com.example.asplatform.repairRequest.domain.RepairRequest;
import com.example.asplatform.repairRequest.dto.requestDTO.DeleteRepairRequestsRequestDto;
import com.example.asplatform.repairRequest.dto.requestDTO.RepairRequestCreateDto;
import com.example.asplatform.repairRequest.dto.responseDTO.CustomerRepairRequestListDto;
import com.example.asplatform.repairRequest.dto.responseDTO.DeleteRepairRequestsResponseDto;
import com.example.asplatform.repairRequest.dto.responseDTO.RepairRequestListDto;
import com.example.asplatform.repairRequest.repository.RepairRequestRepository;
import com.example.asplatform.user.domain.User;
import com.example.asplatform.user.domain.UserAddress;
import com.example.asplatform.user.repository.UserAddressRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class RepairRequestService {

	private final RepairRequestRepository repairRequestRepository;
	private final RepairHistoryRepository repairHistoryRepository;
	private final RepairableItemRepository repairableItemRepository;
	private final UserAddressRepository userAddressRepository;
	private final EngineerRepository engineerRepository;
	private final ApplicationEventPublisher publisher;

	@PersistenceContext
	private EntityManager em;

	/**
	 * 수리 요청 등록
	 * 
	 * @param userId
	 * @param dto
	 * @return
	 */
	@Transactional
	public Long createRepairRequest(User user, RepairRequestCreateDto dto) {

		// 1. 연관 엔티티 조회
		RepairableItem item = repairableItemRepository.findById(dto.getRepairableItemId())
				.orElseThrow(() -> new IllegalArgumentException("제품 정보가 잘못되었습니다."));

		// 2. 수리 요청 저장
		RepairRequest repairRequest = RepairRequest.builder().user(user).repairableItem(item).title(dto.getTitle())
				.description(dto.getDescription()).contactPhone(dto.getContactPhone()).status(RepairStatus.PENDING)
				.createdAt(LocalDateTime.now()).build();

		repairRequestRepository.save(repairRequest);

		// 3. 상태 변경 이력 저장
		RepairHistory history = RepairHistory.builder().repairRequest(repairRequest)
				.previousStatus(RepairStatus.PENDING).newStatus(RepairStatus.PENDING).changedBy(user)
				.memo("관리자 접수/반려 선택 전 상태").build();

		repairHistoryRepository.save(history);

		publisher.publishEvent(new com.example.asplatform.notify.event.RepairRequestCreatedEvent(
  		repairRequest.getRequestId(),
  		user.getId(),
  		"수리 요청이 접수되었습니다",
		String.format("요청 #%d이(가) 접수되었습니다. 담당자 배정까지 잠시만 기다려주세요.", repairRequest.getRequestId())
));

		return repairRequest.getRequestId();
	}

	/**
	 * 고객 본인의 수리 요청 목록을 상태 그룹과 키워드로 조회.
	 * 
	 * @param userId      사용자 ID
	 * @param statusGroup 상태 그룹 (IN_PROGRESS, COMPLETED, CANCELED)
	 * @param keyword     제목 또는 제품명 키워드 (nullable)
	 * @param pageable    페이징 정보
	 * @return 수리 요청 목록 응답 페이지
	 */
	public Page<RepairRequestListDto> getUserRepairRequests(User user, StatusGroup statusGroup, String keyword,
			Pageable pageable) {
		Set<RepairStatus> statusList = statusGroup.toStatusSet();

		return repairRequestRepository.findByUserIdAndStatusesWithKeyword(user.getId(), statusList, keyword, pageable)
				.map(RepairRequestListDto::from);
	}

	/**
	 * 수리기사 본인에게 할당된 수리 요청 목록 조회
	 * 
	 * @param engineerId
	 * @param keyword
	 * @param page
	 * @param size
	 * @return
	 */
	public Page<RepairRequestListDto> getEngineerRequestList(User user, RepairStatus status, Long categoryId,
			String keyword, int page,
			int size) {

		Long engineerId = user.getId();
		Pageable pageable = PageRequest.of(Math.max(0, page), (size <= 0 || size > 100) ? 20 : size,
				Sort.by(Sort.Direction.DESC, "createdAt"));

		Page<RepairRequest> result = repairRequestRepository.findEngineerList(engineerId, status, categoryId,
				(keyword == null || keyword.isBlank()) ? null : keyword.trim(), pageable);

		// 주소 배치 로딩
		List<Long> userIds = result.getContent().stream().map(rr -> rr.getUser().getId()).distinct().toList();

		Map<Long, UserAddress> addrMap = userAddressRepository.findByUserIds(userIds).stream()
				.collect(Collectors.toMap(a -> a.getUser().getId(), Function.identity()));

		// 고객용 DTO 재사용 + 전화번호 포맷팅 동일 적용
		List<RepairRequestListDto> content = result.getContent().stream().map(rr -> {
			// DTO.from(entity) 그대로 쓰되, 전화 포맷팅 규칙을 고객용과 동일하게 유지
			RepairRequestListDto dto = RepairRequestListDto.from(rr);
			// 주소 세팅
			UserAddress ad = addrMap.get(rr.getUser().getId());
			if (ad != null) {
				dto.setPostalCode(ad.getPostalCode());
				dto.setRoadAddress(ad.getRoadAddress());
				dto.setDetailAddress(ad.getDetailAddress());
			}
			return dto;
		}).toList();

		return new PageImpl<>(content, result.getPageable(), result.getTotalElements());
	}

	/**
	 * 해당 고객사에 소속된 수리 요청 목록 조회
	 * 
	 * @param customerId
	 * @param keyword
	 * @param categoryId
	 * @param status
	 * @param pageable
	 * @return
	 */

	public Page<CustomerRepairRequestListDto> getCustomerRequestList(Long customerId, String keyword, Long categoryId,
			RepairStatus status, Pageable pageable) {

		return repairRequestRepository.findCustomerList(customerId, keyword, categoryId, status, pageable);
	}

	@Transactional
	public DeleteRepairRequestsResponseDto deleteRequests(DeleteRepairRequestsRequestDto req, User user) {

		System.out.println(user);

		if (user.getRole() != Role.CUSTOMER) {
			throw new AccessDeniedException("고객사 관리자만 삭제할 수 있습니다.");
		}

		Long customerId = user.getCustomer().getId();
		Long userId = user.getId();

		// 상태 허용 조건
		var allowedStatuses = List.of(RepairStatus.CANCELED, RepairStatus.COMPLETED);

		// 삭제 가능한 대상 id 선별
		List<Long> requested = req.ids();
		List<Long> deletableIds = repairRequestRepository.findDeletableIds(requested, customerId, allowedStatuses);

		// 소프트 딜리트
		int deletedCount = 0;
		if (!deletableIds.isEmpty()) {
			deletedCount = repairRequestRepository.softDeleteByIds(deletableIds, userId, allowedStatuses);
		}

		// 스킵된 ID 계산
		var skipped = new ArrayList<>(new HashSet<>(requested));
		skipped.removeAll(deletableIds);

		String msg = "삭제 처리 완료";
		if (!skipped.isEmpty()) {
			msg += " (권한 없음/상태 불가/이미 삭제/존재하지 않음: " + skipped.size() + "건)";
		}
		return new DeleteRepairRequestsResponseDto(deletedCount, skipped, msg);
	}

	/** 접수: ENGINEER는 본인 자동배정, CUSTOMER는 engineerId 필수 */
	@Transactional
	public RepairRequestSimpleResponse accept(Long requestId, User currentUser, Long engineerId, String memo) {
		final var rr = repairRequestRepository.findById(requestId)
				.orElseThrow(() -> new IllegalArgumentException("요청 없음: " + requestId));

		if (rr.getStatus() == RepairStatus.CANCELED || rr.getStatus() == RepairStatus.COMPLETED)
			throw new IllegalStateException("종료된 요청은 접수 불가");

		String role = currentUser.getRole().name();
		Long prevEngineerId = rr.getEngineer() != null ? rr.getEngineer().getId() : null;

		if ("ENGINEER".equals(role)) {
			if (rr.getEngineer() == null) {
				rr.setEngineer(em.getReference(User.class, currentUser.getId()));
			} else if (!rr.getEngineer().getId().equals(currentUser.getId())) {
				throw new AccessDeniedException("다른 기사에게 배정된 요청은 접수 불가");
			}
		} else if ("CUSTOMER".equals(role)) {
			if (engineerId == null)
				throw new IllegalArgumentException("engineerId는 필수입니다.");
			if (!engineerRepository.existsById(engineerId))
				throw new IllegalArgumentException("엔지니어 없음: " + engineerId);
			rr.setEngineer(em.getReference(User.class, engineerId));
		} else
			throw new AccessDeniedException("권한 없음");

		var prev = rr.getStatus();
		rr.setStatus(RepairStatus.WAITING_FOR_REPAIR);

		repairHistoryRepository.save(RepairHistory.builder()
				.repairRequest(rr)
				.previousStatus(prev)
				.newStatus(RepairStatus.WAITING_FOR_REPAIR)
				.changedBy(currentUser)
				.memo(memo)
				.build());
		
		String engName = (rr.getEngineer()!=null && rr.getEngineer().getName()!=null)
  		? rr.getEngineer().getName() : "담당자";

		// 🔔 요청자에게
		publisher.publishEvent(new com.example.asplatform.notify.event.StatusChangedEvent(
		rr.getRequestId(),
  		rr.getUser().getId(),
  		prev.name(),
  		RepairStatus.WAITING_FOR_REPAIR.name(),
		"담당자가 배정되었습니다",
  		String.format("요청 #%d이 기사(%s)에게 배정되었습니다.", rr.getRequestId(), engName)
));

		// 🔔 배정 기사에게
		publisher.publishEvent(new com.example.asplatform.notify.event.StatusChangedEvent(
  		rr.getRequestId(),
  		rr.getEngineer().getId(),
  		prev.name(),
  		RepairStatus.WAITING_FOR_REPAIR.name(),
		"새 작업이 배정되었습니다",
  		String.format("요청 #%d이 배정되었습니다. 작업을 시작해주세요.", rr.getRequestId())
));

		Long newEngineerId = rr.getEngineer() != null ? rr.getEngineer().getId() : null;
		if (newEngineerId != null)
			refreshEngineerAssignedFlag(newEngineerId);
		if (prevEngineerId != null && !prevEngineerId.equals(newEngineerId))
			refreshEngineerAssignedFlag(prevEngineerId);

		return RepairRequestSimpleResponse.builder()
				.requestId(rr.getRequestId())
				.status(rr.getStatus())
				.updatedAt(LocalDateTime.now())
				.engineerId(newEngineerId)
				.build();
	}

	/** 반려: ENGINEER는 자기 배정건만, CUSTOMER는 사유만 필수 */
	@Transactional
	public RepairRequestSimpleResponse reject(Long requestId, User currentUser, String reason) {
		if (reason == null || reason.isBlank())
			throw new IllegalArgumentException("반려 사유 필수");

		final var rr = repairRequestRepository.findById(requestId)
				.orElseThrow(() -> new IllegalArgumentException("요청 없음: " + requestId));

		String role = currentUser.getRole().name();
		Long prevEngineerId = rr.getEngineer() != null ? rr.getEngineer().getId() : null;

		if ("ENGINEER".equals(role)) {
			if (prevEngineerId == null || !prevEngineerId.equals(currentUser.getId()))
				throw new AccessDeniedException("배정된 기사만 반려 가능");
		} else if (!"CUSTOMER".equals(role)) {
			throw new AccessDeniedException("권한 없음");
		}

		var prev = rr.getStatus();
		rr.setStatus(RepairStatus.CANCELED);
		rr.setEngineer(null);

		repairHistoryRepository.save(RepairHistory.builder()
				.repairRequest(rr)
				.previousStatus(prev)
				.newStatus(RepairStatus.CANCELED)
				.changedBy(currentUser)
				.memo(reason)
				.build());

		publisher.publishEvent(new com.example.asplatform.notify.event.StatusChangedEvent(
  		rr.getRequestId(),
  		rr.getUser().getId(),
  		prev.name(),
  		RepairStatus.CANCELED.name(),
  		"수리 요청이 반려되었습니다",
		String.format("요청 #%d이(가) 반려되었습니다. 사유: %s", rr.getRequestId(), reason)
));

		if (prevEngineerId != null) refreshEngineerAssignedFlag(prevEngineerId);
		if (prevEngineerId != null)
			refreshEngineerAssignedFlag(prevEngineerId);

		return RepairRequestSimpleResponse.builder()
				.requestId(rr.getRequestId())
				.status(rr.getStatus())
				.updatedAt(LocalDateTime.now())
				.engineerId(null)
				.build();
	}

	/** 수리 시작: WAITING_FOR_REPAIR → IN_PROGRESS (배정된 엔지니어만) */
	@Transactional
	public RepairRequestSimpleResponse startWork(Long requestId, User currentUser) {
		final var rr = repairRequestRepository.findById(requestId)
				.orElseThrow(() -> new IllegalArgumentException("요청 없음: " + requestId));

		if (rr.getEngineer() == null || !rr.getEngineer().getId().equals(currentUser.getId()))
			throw new AccessDeniedException("배정된 기사만 시작할 수 있습니다.");

		if (rr.getStatus() != RepairStatus.WAITING_FOR_REPAIR)
			throw new IllegalStateException("현재 상태(" + rr.getStatus() + ")에서는 시작할 수 없습니다.");

		var prev = rr.getStatus();
		rr.setStatus(RepairStatus.IN_PROGRESS);

		repairHistoryRepository.save(RepairHistory.builder()
				.repairRequest(rr)
				.previousStatus(prev)
				.newStatus(RepairStatus.IN_PROGRESS)
				.changedBy(currentUser)
				.memo("작업 시작")
				.build());
		
		publisher.publishEvent(new com.example.asplatform.notify.event.StatusChangedEvent(
  		rr.getRequestId(),
  		rr.getUser().getId(),
  		prev.name(),
  		RepairStatus.IN_PROGRESS.name(),
  		"1차 견적/작업이 시작되었습니다",
  		String.format("요청 #%d 작업을 시작했습니다.", rr.getRequestId())
));
		refreshEngineerAssignedFlag(currentUser.getId());

		return RepairRequestSimpleResponse.builder()
				.requestId(rr.getRequestId())
				.status(rr.getStatus())
				.updatedAt(LocalDateTime.now())
				.engineerId(currentUser.getId())
				.build();
	}

	// RepairRequestService.java
	@Transactional
	public RepairRequestSimpleResponse completeForTest(Long requestId, User currentUser, String memo) {
		final var rr = repairRequestRepository.findById(requestId)
				.orElseThrow(() -> new IllegalArgumentException("요청 없음: " + requestId));

		// IN_PROGRESS에서만 완료 허용 (대충 테스트용)
		if (rr.getStatus() != RepairStatus.IN_PROGRESS) {
			throw new IllegalStateException("현재 상태(" + rr.getStatus() + ")에서는 완료 처리 불가");
		}

		var prev = rr.getStatus();
		rr.setStatus(RepairStatus.COMPLETED);

		repairHistoryRepository.save(RepairHistory.builder()
				.repairRequest(rr)
				.previousStatus(prev)
				.newStatus(RepairStatus.COMPLETED)
				.changedBy(currentUser)
				.memo(memo != null ? memo : "테스트 완료 처리")
				.build());

		publisher.publishEvent(new com.example.asplatform.notify.event.StatusChangedEvent(
  		rr.getRequestId(),
  		rr.getUser().getId(),
  		prev.name(),
  		RepairStatus.COMPLETED.name(),
  		"수리가 완료되었습니다",
  		String.format("요청 #%d 처리가 완료되었습니다. 이용해 주셔서 감사합니다.", rr.getRequestId())
));

		// 기사 배정 캐시 갱신 (활성 건 없으면 is_assigned=0)
		Long engId = rr.getEngineer() != null ? rr.getEngineer().getId() : null;
		if (engId != null)
			refreshEngineerAssignedFlag(engId);

		return RepairRequestSimpleResponse.builder()
				.requestId(rr.getRequestId())
				.status(rr.getStatus())
				.updatedAt(java.time.LocalDateTime.now())
				.engineerId(engId)
				.build();
	}

	/** 엔지니어 활성 작업 캐시 갱신 */
	private void refreshEngineerAssignedFlag(Long engineerId) {
		boolean hasActive = repairRequestRepository.existsByEngineer_IdAndStatusIn(
				engineerId,
				List.of(
						RepairStatus.WAITING_FOR_REPAIR,
						RepairStatus.IN_PROGRESS,
						RepairStatus.WAITING_FOR_PAYMENT,
						RepairStatus.WAITING_FOR_DELIVERY));
		engineerRepository.findById(engineerId).ifPresent(e -> e.setAssigned(hasActive));
	}
}
