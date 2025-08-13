// src/main/java/com/example/asplatform/location/dto/CustomerPinDto.java
package com.example.asplatform.location.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CustomerPinDto {
    private Long customerId;
    private String companyName;
    private String contactEmail;
    private String contactPhone;
    private String openingHours;
    private GeoPointDto point; // (lat, lng)
}
