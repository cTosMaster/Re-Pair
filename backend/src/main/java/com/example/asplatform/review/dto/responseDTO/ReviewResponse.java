package com.example.asplatform.review.dto.responseDTO;

import com.example.asplatform.review.domain.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewResponse {
    private Long reviewId;
    private Long repairId;
    private String repairTitle;   // req.title -> 수리요청 보낼때 제목(title)
    private String username;      // u.name (또는 u.username)
    private int rating;
    private String reviewContent;
    private LocalDateTime createdAt;
}

