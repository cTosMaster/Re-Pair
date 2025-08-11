package com.example.asplatform.review.dto.requestDTO;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReviewRequest {
    private Long repairId;
    private int rating;
    private String reviewContent;
}

