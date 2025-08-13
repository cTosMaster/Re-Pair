package com.example.asplatform.user.dto.requestDTO;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/** PATCH /api/users/me */
@Getter @Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UpdateMyProfileRequest {
    @Size(min = 1, max = 100)
    private String name;

    @Size(max = 255)
    private String phone;

    @Size(max = 255)
    private String imageUrl;

    // 주소(선택). 일부만 보내도 됨
    @Size(min = 5, max = 5)
    private String postalCode;

    @Size(max = 255)
    private String roadAddress;

    @Size(max = 255)
    private String detailAddress;

    // 좌표(선택) - 둘 다 함께 오면 갱신
    private Double lat;   // 위도
    private Double lng;   // 경도
}
