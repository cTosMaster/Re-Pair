package com.example.asplatform.item.domain;

import java.time.LocalDateTime;

import com.example.asplatform.category.domain.CustomerCategory;
import com.example.asplatform.customer.domain.Customer;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "repairable_items")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RepairableItem {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "item_id")
	private Long itemId;

	// 고객사 연관
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "customer_id", nullable = false)
	private Customer customer;

	// 고객사 카테고리 연관
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "category_id", nullable = false)
	private CustomerCategory category;

    // 제품명 (예: 아이폰 13)
    @Column(nullable = false)
    private String name;


	// 단가 (0 = 미정)
	@Column(nullable = false)
	private Integer price;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;

	@PrePersist
	public void prePersist() {
		this.createdAt = LocalDateTime.now();
		if (this.price == null) {
			this.price = 0;
		}
	}

	public void update(CustomerCategory category, String name, Integer price) {
		this.category = category;
		this.name = name;
		this.price = price != null ? price : 0;
	}

}
