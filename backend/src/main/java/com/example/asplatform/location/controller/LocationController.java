// src/main/java/com/example/asplatform/location/controller/LocationController.java
package com.example.asplatform.location.controller;

import com.example.asplatform.location.dto.MapPinsResponse;
import com.example.asplatform.location.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/location")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    /** 로그인한 사용자 위치 + 모든 고객사 핀 정보 */
    @GetMapping("/pins")
    @PreAuthorize("isAuthenticated()") // USER / CUSTOMER / ENGINEER / ADMIN
    public ResponseEntity<MapPinsResponse> pins() {
        return ResponseEntity.ok(locationService.getPins());
    }
}
