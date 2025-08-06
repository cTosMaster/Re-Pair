package com.example.asplatform.category.domain;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlatformCategory {
	
	 @Id
	 @GeneratedValue(strategy = GenerationType.IDENTITY)
	 private Long categoryId;

	 private String name;

	 @CreationTimestamp
	 private LocalDateTime createdAt;
}
