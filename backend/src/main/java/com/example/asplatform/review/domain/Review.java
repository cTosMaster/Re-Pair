package com.example.asplatform.review.domain;

import com.example.asplatform.repair.domain.Repair;
import com.example.asplatform.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder // ✅ 이거 추가
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repair_id")
    private Repair repair;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private int rating;

    @Column(name = "review_content", columnDefinition = "TEXT")
    private String reviewContent;

    private LocalDateTime createdAt = LocalDateTime.now();
}
