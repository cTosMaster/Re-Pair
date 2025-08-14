package com.example.asplatform.review.dto.requestDTO;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ReviewUpdateRequest {
    @Min(1) @Max(5)
    private Integer rating;
    private String reviewContent;
}
