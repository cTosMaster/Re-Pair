package com.example.asplatform.repairRequest.dto.requestDTO;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DeleteRepairRequestsRequestDto(@NotNull @Size(min = 1, max = 100) List<Long> ids) {

}
