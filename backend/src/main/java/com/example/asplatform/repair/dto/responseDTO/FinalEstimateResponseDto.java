package com.example.asplatform.repair.dto.responseDTO;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinalEstimateResponseDto {
	
	private Long repairId;
	private Long requestId;
	private String description;
	private Integer finalPrice;
	private List<String> imageUrl; // s3에 업로드 수 url 
	private List<String> presets; 
	

}
