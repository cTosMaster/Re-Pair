package com.example.asplatform.repairRequest.dto.responseDTO;

import com.example.asplatform.common.util.StatusGroupMapper;
import com.example.asplatform.repairRequest.domain.RepairRequest;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class RepairRequestListDto {
	private Long requestid;
	private String title;
	private String category;
	private String item;
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private String createdAt;
	private String status;
	private String statusGroup;
	private String userName;
	private String userPhone;
	private String companyName;
	private String postalCode;
	private String roadAddress;
	private String detailAddress;

	public static RepairRequestListDto from(RepairRequest entity) {
		return RepairRequestListDto.builder().requestid(entity.getRequestId()).title(entity.getTitle())
				.category(entity.getRepairableItem().getCategory().getName()).item(entity.getRepairableItem().getName())
				.createdAt(entity.getCreatedAt().toLocalDate().toString()).status(entity.getStatus().getLabel())
				.statusGroup(StatusGroupMapper.toGroup(entity.getStatus()).getLabel())
				.userName(entity.getUser().getName()).userPhone(formatPhone(entity.getUser().getPhone()))
				.companyName(entity.getRepairableItem().getCustomer().getCompanyName()).build();
	}

	private static String formatPhone(String phone) { // 휴대폰 번호 포맷팅
		if (phone == null)
			return null;
		String d = phone.replaceAll("\\D", "");
		return d.replaceFirst("(\\d{3})(\\d{4})(\\d{4})", "$1-$2-$3");
	}
}