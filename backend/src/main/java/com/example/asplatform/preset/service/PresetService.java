package com.example.asplatform.preset.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.asplatform.admin.repository.PlatformCategoryRepository;
import com.example.asplatform.auth.service.CustomUserDetails;
import com.example.asplatform.customer.domain.Customer;
import com.example.asplatform.customer.repository.CustomerRepository;
import com.example.asplatform.item.repository.RepairableItemRepository;
import com.example.asplatform.preset.domain.Preset;
import com.example.asplatform.preset.dto.requestDTO.PresetRequestDto;
import com.example.asplatform.preset.dto.responseDTO.PresetResponseDto;
import com.example.asplatform.preset.repository.PresetRepository;


import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PresetService {
	
	private final PresetRepository presetRepository;
	private final PlatformCategoryRepository platformCategoryRepository;
	private final RepairableItemRepository repairableItemRepository;
	private final CustomerRepository customerRepository;
	
	/**
	 * ✅ 1. 프리셋 전체 목록 조회하기
	 * @return
	 */
	public Page<PresetResponseDto> getAllPreset(int page) {	
		// ADMIN 권한을 가지면 모든 프리셋 조회 가능 
	    Pageable pageable = PageRequest.of(page, 10); // 10개 단위

	    Page<Preset> presetPage;

	    if (isAdmin()) {
	        presetPage = presetRepository.findAll(pageable);
	    } else {
	        Long customerId = getCurrentCustomerId();
	        presetPage = presetRepository.findByCustomer_Id(customerId, pageable);
	    }

	    return presetPage.map(this::convertToResponseDto);
	}
	
	/**
	 * ✅ 2. 아이템 + 카테고리별 프리셋 조회하기
	 * @param categoryId
	 * @param itemId
	 * @return
	 */
	public Page<PresetResponseDto> getPresetsByCategoryAndItem(Long categoryId, Long itemId, int page) {
	    Pageable pageable = PageRequest.of(page, 10);

	    Page<Preset> presetPage;
	    if (isAdmin()) {
	        presetPage = presetRepository.findByCategory_CategoryIdAndItem_ItemId(categoryId, itemId, pageable);
	    } else {
	        Long customerId = getCurrentCustomerId();
	        presetPage = presetRepository.findByCustomer_IdAndCategory_CategoryIdAndItem_ItemId(
	                customerId, categoryId, itemId, pageable);
	    }

	    return presetPage.map(this::convertToResponseDto);
	}
	
	/**
	 * ✅ 3. 프리셋 등록하기
	 * @param dto
	 * @return
	 */
	public PresetResponseDto createPreset(PresetRequestDto dto) {
		
		// 현재 로그인 한 아이디 가져오기 
		Long currentCustomerId = getCurrentCustomerId();
		
		// 고객사 조회하기 
	    Customer customer = customerRepository.findById(currentCustomerId)
	    		.orElseThrow(()-> new RuntimeException("고객사를 찾을 수 없습니다."));
		
		var category = platformCategoryRepository.findById(dto.getCategoryId())
				.orElseThrow(()-> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));
		var item = repairableItemRepository.findById(dto.getItemId())
				.orElseThrow(()-> new IllegalArgumentException("제품을 찾을 수 없습니다."));
		
		Preset preset = new Preset();
		preset.setCustomer(customer);
        preset.setCategory(category);
        preset.setItem(item);
        preset.setName(dto.getName());
        preset.setDescription(dto.getDescription());
        preset.setPrice(dto.getPrice());

        Preset savedPreset = presetRepository.save(preset);

        return convertToResponseDto(savedPreset);
	}
	
	/**
	 * ✅ 4. 프리셋 수정하기
	 * @param presetId
	 * @param dto
	 * @return
	 */
	public PresetResponseDto updatePreset(Long presetId , PresetRequestDto dto) {
		// 프리셋 아이디로 프리셋 찾기 
		Preset preset = presetRepository.findById(presetId)
	                .orElseThrow(() -> new IllegalArgumentException("Preset not found"));
		
		 if ( !preset.getCustomer().getId().equals(getCurrentCustomerId())) {
		        throw new AccessDeniedException("본인 고객사의 프리셋만 수정할 수 있습니다.");
		    }
		var category = platformCategoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        var item = repairableItemRepository.findById(dto.getItemId())
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

        preset.setCategory(category);
        preset.setItem(item);
        preset.setName(dto.getName());
        preset.setDescription(dto.getDescription());
        preset.setPrice(dto.getPrice());

        Preset updatedPreset = presetRepository.save(preset);
        return convertToResponseDto(updatedPreset);
	}
	
	/**
	 * ✅ 5. 프리셋 삭제하기
	 * @param presetId
	 */
	public void deletePreset(Long presetId) {
		Preset preset = presetRepository.findById(presetId)
				.orElseThrow(() -> new IllegalArgumentException("프리셋을 찾을 수 없습니다."));
		if ( !preset.getCustomer().getId().equals(getCurrentCustomerId())) {
	        throw new AccessDeniedException("본인 고객사의 프리셋만 삭제할 수 있습니다.");
	    }
		 presetRepository.delete(preset);
	}
	
	/**
	 * ✅ 6. 프리셋 금액 자동 계산하기
	 * @param presetIds
	 * @return
	 */
	public Integer calculatePrice(List<Long> presetIds) {
		int totalPrice = 0;
		Long currentCustomerId = getCurrentCustomerId();
		
		for(Long presetId : presetIds) {
			 Preset preset = presetRepository.findById(presetId)
			        .orElseThrow(() -> new IllegalArgumentException("프리셋을 찾을 수 없습니다."));
			        
			 if (!preset.getCustomer().getId().equals(currentCustomerId)) {
			      throw new AccessDeniedException("본인 고객사의 프리셋만 계산할 수 있습니다.");
			 }

			 totalPrice += preset.getPrice();
		}
		return totalPrice;
	}
	
	/**
	 * ✅ 7. 단일 프리셋 견적 미리 보기
	 * @param presetId
	 * @return
	 */
	public PresetResponseDto getPresetPreview(Long presetId) {
		Preset preset = presetRepository.findById(presetId)
				.orElseThrow(()-> new IllegalArgumentException("프리셋을 찾을 수 없습니다."));
		
		// admin이면 모든 프리셋 접근 가능
	    if (isAdmin()) {
	        return convertToResponseDto(preset);
	    }
		
	    
	    // customer 또는 engineer는 자신의 고객사 프리셋만 접근 가능
	    if (isCustomerOrEngineer()) {
	        Long currentCustomerId = getCurrentCustomerId();
	        if (!preset.getCustomer().getId().equals(currentCustomerId)) {
	            throw new AccessDeniedException("본인 고객사의 프리셋만 조회할 수 있습니다.");
	        }
	        return convertToResponseDto(preset);
	    }

	    // 그 외 권한은 접근 불가
	    throw new AccessDeniedException("권한이 없어 프리셋을 조회할 수 없습니다.");
	}
	
	/**
	 * convertToResponseDto 메소드
	 */
	private PresetResponseDto convertToResponseDto(Preset preset) {
        PresetResponseDto responseDTO = new PresetResponseDto();
        responseDTO.setPresetId(preset.getPresetId());
        responseDTO.setCategoryId(preset.getCategory().getCategoryId());
        responseDTO.setItemId(preset.getItem().getItemId());
        responseDTO.setName(preset.getName());
        responseDTO.setDescription(preset.getDescription());
        responseDTO.setPrice(preset.getPrice());
        responseDTO.setCreatedAt(preset.getCreatedAt());
        return responseDTO;
    }
	
	/**
	 * 현재 고객사 아이디 가져오기
	 * @return
	 */
	private Long getCurrentCustomerId() {
	    CustomUserDetails userDetails = (CustomUserDetails)
	        SecurityContextHolder.getContext().getAuthentication().getPrincipal();
	    return userDetails.getCustomerId();
	}
	
	/**
	 * 관리자인지 확인하기
	 * @return
	 */
	private boolean isAdmin() {
		 return SecurityContextHolder.getContext().getAuthentication().getAuthorities()
			        .stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
	}
	
	/**
	 * customer 또는 engineer 권한인지 확인하기
	 * @return
	 */
	private boolean isCustomerOrEngineer() {
	    return SecurityContextHolder.getContext().getAuthentication().getAuthorities()
	            .stream()
	            .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER") 
	                        || a.getAuthority().equals("ROLE_ENGINEER"));
	}
}