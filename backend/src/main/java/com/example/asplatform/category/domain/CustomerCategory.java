package com.example.asplatform.category.domain;

import java.time.LocalDateTime;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

@Entity
@Table(name = "customer_categories")
@SQLDelete(sql = "UPDATE customer_categories SET is_deleted = true WHERE category_id = ?")
@Where(clause = "is_deleted = false")
@Getter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PUBLIC)
@Builder
public class CustomerCategory {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Long id;

    // 어떤 고객사 소속인지
    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    // 카테고리 이름 (ex: 휴대폰, UMPC)
    @Column(nullable = false)
    private String name;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;
    

    @Column(name="is_deleted", nullable=false)
    private boolean deleted;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // 카테고리 이름만 수정하고 싶을 시
    public void updateName(String name) {
        this.name = name;
    }
}

