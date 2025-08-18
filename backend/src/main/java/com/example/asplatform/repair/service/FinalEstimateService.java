package com.example.asplatform.repair.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.asplatform.auth.service.CustomUserDetails;
import com.example.asplatform.common.enums.Role;
import com.example.asplatform.customer.domain.Customer;
import com.example.asplatform.preset.domain.Preset;
import com.example.asplatform.preset.repository.PresetRepository;
import com.example.asplatform.repair.domain.Repair;
import com.example.asplatform.repair.domain.RepairImage;
import com.example.asplatform.repair.domain.RepairPresetUsage;
import com.example.asplatform.repair.dto.responseDTO.FinalEstimateResponseDto;
import com.example.asplatform.repair.repository.RepairImageRepository;
import com.example.asplatform.repair.repository.RepairPresetUsageRepository;
import com.example.asplatform.repair.repository.RepairRepository;
import com.example.asplatform.repair.requestDto.FinalEstimateRequestDto;
import com.example.asplatform.repairRequest.domain.RepairRequest;
import com.example.asplatform.repairRequest.repository.RepairRequestRepository;
import com.example.asplatform.user.domain.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FinalEstimateService {

    private final RepairRepository repairRepository;
    private final RepairRequestRepository repairRequestRepository;
    private final RepairImageRepository repairImageRepository;
    private final RepairPresetUsageRepository repairPresetUsageRepository;
    private final PresetRepository presetRepository;
    

    /**
     * ✅ 1. 최종 견적서 등록하기
     * @param requestId
     * @param dto
     * @return
     */
    @Transactional
    public FinalEstimateResponseDto createFinalEstimate(Long requestId, FinalEstimateRequestDto dto,  CustomUserDetails currentUser) {
        Repair repair = Repair.builder()
                .request(repairRequestRepository.findById(requestId)
                        .orElseThrow(() -> new IllegalArgumentException("수리 요청을 찾을 수 없습니다.")))
                .description(dto.getDescription())
                .finalPrice(dto.getFinalPrice())
                .build();
        repairRepository.save(repair);

        savePresetsAndImages(repair, dto, currentUser);

        return buildResponseDto(repair);
    }

    /**
     * ✅ 2. 최종 견적서 수정하기
     * @param repairId
     * @param dto
     * @return
     */
    @Transactional
    public FinalEstimateResponseDto updateFinalEstimate(Long repairId, FinalEstimateRequestDto dto,  CustomUserDetails currentUser) {
        Repair repair = repairRepository.findById(repairId)
                .orElseThrow(() -> new IllegalArgumentException("최종 견적서를 찾을 수 없습니다."));

        // Repair 엔티티 업데이트
        repair.setDescription(dto.getDescription());
        repair.setFinalPrice(dto.getFinalPrice() != null ? dto.getFinalPrice() : 0);
        repairRepository.save(repair);

        // 기존 프리셋 삭제 후 새로 등록
        repairPresetUsageRepository.deleteAllByRepair_Id(repairId);
        // 기존 이미지 삭제 후 새로 등록
        repairImageRepository.deleteAllByRepair_Id(repairId);

        savePresetsAndImages(repair, dto, currentUser);

        return buildResponseDto(repair);
    }

    /**
     * ✅ 3. 최종 견적서 단일 조회하기
     * @param repairId
     * @return
     */
    @Transactional(readOnly = true)
    public FinalEstimateResponseDto getFinalEstimate(Long repairId, CustomUserDetails currentUser) {
    	
    	Repair repair = repairRepository.findById(repairId)
                .orElseThrow(() -> new IllegalArgumentException("최종 견적서를 찾을 수 없습니다."));

    	RepairRequest rr = repair.getRequest();
        if (rr == null) {
            throw new IllegalStateException("RepairRequest가 존재하지 않습니다.");
        }
        
        // 고객사 id 추출하기
        Long customerId = null;
        if (rr.getRepairableItem() != null && rr.getRepairableItem().getCustomer() != null) {
            customerId = rr.getRepairableItem().getCustomer().getId();
        } else if (rr.getUser() != null && rr.getUser().getCustomer() != null) {
            customerId = rr.getUser().getCustomer().getId();
        }

        // 권한 추출하기 
        Role role = currentUser.getUser().getRole();
        User repairUser = repair.getRequest().getUser();
        
        // 1) 수리기사 & 고객사 관리자 -> 같은 고객사만 접근 가능 
        if ( role == Role.ENGINEER || role == Role.CUSTOMER) {
            if (customerId == null || !Objects.equals(customerId, currentUser.getCustomerId())) {
                throw new AccessDeniedException("해당 고객사의 수리 견적서가 아닙니다.");
            }
        }
        
        // 2) 일반 사용자 -> 본인이 요청한 건만 접근 가능 
        if ( role == Role.USER) {
            if (!Objects.equals(repairUser.getId(), currentUser.getId())) {
                throw new AccessDeniedException("본인의 수리 견적서만 조회할 수 있습니다.");
            }
        }
        return buildResponseDto(repair);
    }
    
    /**
     * ✅ 4. 전체 조회하기
     * @param page
     * @param currentUser
     * @return
     */
    @Transactional(readOnly = true)
    public Page<FinalEstimateResponseDto> getAllFinalEstimates(int page, CustomUserDetails currentUser) {
        Pageable pageable = PageRequest.of(page, 10);
        Role role = currentUser.getUser().getRole();
        Page<Repair> repairs;

        if (role == Role.USER) {
            repairs = repairRepository.findByRequest_User_Id(currentUser.getId(), pageable);
        } else if (role == Role.ENGINEER || role == Role.CUSTOMER) {
            repairs = repairRepository.findByCustomerId(currentUser.getCustomerId(), pageable);
        } else {
            throw new AccessDeniedException("권한이 없습니다.");
        }

        return repairs.map(this::buildResponseDto);
    }

   
    /**
     * 🔴 프리셋 & 이미지 저장 공통 메소드
     * @param repair
     * @param dto
     */
    private void savePresetsAndImages(Repair repair, FinalEstimateRequestDto dto , CustomUserDetails currentUser) {
    	// 고객사 아이디 가져오기
    	Long currentCustomerId = currentUser.getCustomerId();

        if (dto.getPresetIds() != null && !dto.getPresetIds().isEmpty()) {
            List<RepairPresetUsage> usages = dto.getPresetIds().stream()
                    .map(presetId ->  {
                        Preset preset = presetRepository.findById(presetId)
                                .orElseThrow(() -> new IllegalArgumentException("프리셋을 찾을 수 없습니다."));

                        // 현재 고객사 확인하기
                        if (!Objects.equals(preset.getCustomer().getId(), currentCustomerId)) {
                            throw new AccessDeniedException("자신의 고객사 프리셋만 추가할 수 있습니다.");
                        }

                        return RepairPresetUsage.builder()
                                .repair(repair)
                                .preset(preset)
                                .usedAt(LocalDateTime.now())
                                .build();
                    })
                    .collect(Collectors.toList());
            repairPresetUsageRepository.saveAll(usages);
        }

        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            List<RepairImage> images = dto.getImages().stream()
                    .map(imgDto -> RepairImage.builder()
                            .repair(repair)
                            .imageType(imgDto.getImageType())
                            .imageUrl(imgDto.getUrl())  
                            .createdAt(LocalDateTime.now())
                            .build())
                    .collect(Collectors.toList());
            repairImageRepository.saveAll(images);
        }
    }

    /**
     * 🔴 Response Dto 생성 공통 메소드
     * @param repair
     * @return
     */
    private FinalEstimateResponseDto buildResponseDto(Repair repair) {
        List<String> imageUrls = repairImageRepository.findByRepair_Id(repair.getId())
                .stream()
                .map(RepairImage::getImageUrl)
                .collect(Collectors.toList());

        List<String> presetNames = repairPresetUsageRepository.findByRepair_Id(repair.getId())
                .stream()
                .map(u -> u.getPreset().getName())
                .collect(Collectors.toList());

        return FinalEstimateResponseDto.builder()
                .repairId(repair.getId())
                .requestId(repair.getRequest().getRequestId())
                .description(repair.getDescription())
                .finalPrice(repair.getFinalPrice())
                .imageUrl(imageUrls)
                .presets(presetNames)
                .build();
    }
}