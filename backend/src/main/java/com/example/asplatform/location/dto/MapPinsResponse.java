// src/main/java/com/example/asplatform/location/dto/MapPinsResponse.java
package com.example.asplatform.location.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MapPinsResponse {
    private MeLocationDto me;
    private List<CustomerPinDto> customers;
}
