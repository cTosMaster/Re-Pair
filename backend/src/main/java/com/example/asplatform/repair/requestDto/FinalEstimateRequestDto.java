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
public class FinalEstimateRequestDto {
	private String description;
	private Integer finalPrice;
	private List<Long> presetIds; // 사용한 프리셋 id 리스트
	private List<ImageUploadDto> images; // 이미지 전/후 업로드 사진들
	
	@Getter
	@Setter
	public static class ImageUploadDto {
		private String url;
		private ImageType imageType; // before/ after 구분하기
	}
	

}
