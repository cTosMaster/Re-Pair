package com.example.asplatform.preset.domain;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.example.asplatform.category.domain.PlatformCategory;
import com.example.asplatform.repair.domain.RepairableItem;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Preset {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long presetId;
	
	 @ManyToOne(fetch = FetchType.LAZY)
	 @JoinColumn(name = "category_id")
	 private PlatformCategory category;

	 @ManyToOne(fetch = FetchType.LAZY)
	 @JoinColumn(name = "item_id")
	 private RepairableItem item;

	 private String name;

	 
	 @Column(columnDefinition = "TEXT")
	 private String description;

	 private Integer price;

	 @CreationTimestamp
	 private LocalDateTime createdAt;
	

}
