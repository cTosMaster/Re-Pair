// src/main/java/com/example/asplatform/customer/controller/CustomerRegistrationController.java
package com.example.asplatform.customer.controller;

import com.example.asplatform.customer.dto.requestDTO.CustomerRegistrationRequest;
import com.example.asplatform.customer.dto.responseDTO.CustomerRegistrationResponse;
import com.example.asplatform.customer.service.CustomerRegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/registration")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerRegistrationController {
    private final CustomerRegistrationService registrationService;

    @PostMapping
    public ResponseEntity<CustomerRegistrationResponse> register(
            @Valid @RequestBody CustomerRegistrationRequest request) {
        CustomerRegistrationResponse response = registrationService.registerCustomer(request);
        return ResponseEntity.ok(response);
    }
}
