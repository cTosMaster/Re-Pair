package com.example.asplatform.repair.requestDto;

import java.util.List;

import com.example.asplatform.common.enums.ImageType;

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
public class FinalEstimateRequestDto {
	private String description;
	private Integer finalPrice;
	private List<Long> presetIds; // 사용한 프리셋 id 리스트
	private List<ImageUploadDto> images; // 이미지 전/후 업로드 사진들
	
	@Getter
	@Setter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class ImageUploadDto {
		private String base64; // base64 인코딩된 이미지 데이터
		private ImageType imageType; // before/ after 구분하기
	}
	

}
