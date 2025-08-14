package com.example.asplatform.customer.dto.requestDTO;

import lombok.Getter;

@Getter
public class CustomerAddressRequest {
    private String postalCode;
    private String roadAddress;
    private String detailAddress;
    private Double latitude;
    private Double longitude;
}
