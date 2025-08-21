package com.example.asplatform.repairRequest.dto.requestDTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RepairStatusChangeRequest {
	private Long requestId;
	private String statusCode;

}
