package com.example.asplatform.repairRequest.dto.responseDTO;

import com.example.asplatform.common.util.StatusGroupMapper;
import com.example.asplatform.repairRequest.domain.RepairRequest;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RepairRequestResponseDto {
    private Long requestid;
    private String title;
    private String category;
    private String item;
    private String createdAt;
    private String status;
    private String statusGroup;
    private String userName;
    private String userPhone;
    private String companyName;

    public static RepairRequestResponseDto from(RepairRequest entity) {
        return RepairRequestResponseDto.builder()
                .requestid(entity.getRequestId())
                .title(entity.getTitle())
                .category(entity.getRepairableItem().getCategory().getName())
                .item(entity.getRepairableItem().getName())
                .createdAt(entity.getCreatedAt().toLocalDate().toString())
                .status(entity.getStatus().getLabel())
                .statusGroup(StatusGroupMapper.toGroup(entity.getStatus()).getLabel())
                .userName(entity.getUser().getName())
                .userPhone(maskPhone(entity.getUser().getPhone()))
                .companyName(entity.getRepairableItem().getCustomer().getCompanyName())
                .build();
    }

    private static String maskPhone(String phone) { // 휴대폰 번호 마스킹처리
        return phone.replaceAll("(\\d{3})\\d{4}(\\d{4})", "$1-****-$2");
    }
}