package com.example.asplatform.engineer.dto.requestDTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateEngineerRequest {
    private String name;
    private String email;
    private String phone;
}
