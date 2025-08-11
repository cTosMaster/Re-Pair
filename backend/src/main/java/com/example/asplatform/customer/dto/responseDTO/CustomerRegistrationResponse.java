// src/main/java/com/example/asplatform/customer/dto/responseDTO/CustomerRegistrationResponse.java
package com.example.asplatform.customer.dto.responseDTO;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CustomerRegistrationResponse {
    private Long customerId;
    private String status;  // 항상 "PENDING"
}
