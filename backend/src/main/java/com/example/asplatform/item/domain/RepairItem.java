package com.example.asplatform.item.domain;

import com.example.asplatform.customer.domain.Customer;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "repairable_items")
@Getter @NoArgsConstructor
public class RepairItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) // 후에 eager로 비교해서 뭐가 더 빠른지 봐볼것
    @JoinColumn(name="customer_id",nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "name")
    private String name;

    @Column(name="price",nullable=false)
    private int price;

    @Column(name="created_at",nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now(); // 엔티티 생성 시점

    public RepairItem(Category category, Customer customer, String name, int price) {
        this.category = category;
        this.customer = customer;
        this.name = name;
        this.price = price;
        this.createdAt = LocalDateTime.now();
    }

}