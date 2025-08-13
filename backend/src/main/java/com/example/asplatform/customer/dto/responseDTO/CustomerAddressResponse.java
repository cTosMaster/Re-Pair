package com.example.asplatform.customer.dto.responseDTO;

import com.example.asplatform.customer.domain.CustomerAddress;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CustomerAddressResponse {
    private String postalCode;
    private String roadAddress;
    private String detailAddress;
    private Double latitude;
    private Double longitude;

    public static CustomerAddressResponse from(CustomerAddress address) {
        return CustomerAddressResponse.builder()
                .postalCode(address.getPostalCode())
                .roadAddress(address.getRoadAddress())
                .detailAddress(address.getDetailAddress())
                .latitude(address.getLocation().getY())
                .longitude(address.getLocation().getX())
                .build();
    }
}
