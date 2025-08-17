package com.example.asplatform.estimate.dto.responseDTO;

public record EstimateCreateResponseDto(
	    Long estimateId,
	    Long requestId,
	    int presetTotal,
	    int manualAmount,
	    int totalPrice,
	    int usedPresetCount,
	    String statusAfter // IN_PROGRESS
	    ) {

}
