// src/main/java/com/example/asplatform/location/dto/MeLocationDto.java
package com.example.asplatform.location.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MeLocationDto {
    private Long userId;
    private String name;
    private String role;       // USER | CUSTOMER | ENGINEER | ADMIN
    private GeoPointDto point; // 주소 없으면 null
}
