package com.example.asplatform.estimate.dto.requestDTO;

import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record EstimateCreateRequestDto(    
		@NotNull Long requestId,
	    @NotNull @Size(max = 50) List<Long> presetIds,  // 빈 리스트 허용
	    @Min(0) Integer manualAmount,                   // null 가능
	    @Size(max = 2000) String description             // 선택 입력
) {}
