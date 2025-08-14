package com.example.asplatform.estimate.dto.responseDTO;

import java.time.LocalDateTime;
import java.util.List;

public record EstimateReadResponseDto(	Long estimateId,
	    Long requestId,
	    int presetTotal,           // null이면 0으로
	    int manualAmount,          // null이면 0으로
	    int totalPrice,            // 저장된 price 그대로
	    String description,
	    LocalDateTime createdAt,
	    int usedPresetCount,
	    List<PresetBrief> presets  ) { // 선택 프리셋 요약(이름/ID)

	  public record PresetBrief(Long presetId, String name, int price /*, Integer currentPriceOpt */) {}
}
