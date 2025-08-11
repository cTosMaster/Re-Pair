package com.example.asplatform.review.dto.responseDTO;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ReviewResponse {
    private Long reviewId;
    private Long repairId;
    private String username;
    private int rating;
    private String reviewContent;
    private LocalDateTime createdAt;
}
