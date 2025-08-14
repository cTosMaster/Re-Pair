// src/main/java/com/example/asplatform/location/dto/GeoPointDto.java
package com.example.asplatform.location.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GeoPointDto {
    private double lat; // 위도
    private double lng; // 경도
}
