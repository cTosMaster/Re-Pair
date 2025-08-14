package com.example.asplatform.repairRequest.dto.responseDTO;

import java.time.LocalDateTime;

import com.example.asplatform.common.enums.RepairStatus;
import com.fasterxml.jackson.annotation.JsonFormat;

public record CustomerRepairRequestListDto(Long id, // 수리요청 id
		String userName, // 고객명
		String title, // 요청 제목
		@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime createdAt, // 요청일시
		RepairStatus status, // 내부 Enum
		String itemName, // 제품명
		String category, // 카테고리명
		String postalCode,
		String roadAddress,
		String detailAddress
) {
}
