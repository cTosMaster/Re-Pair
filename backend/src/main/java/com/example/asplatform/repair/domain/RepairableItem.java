package com.example.asplatform.repair.domain;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.example.asplatform.category.domain.PlatformCategory;
import com.example.asplatform.customer.domain.Customer;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RepairableItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private PlatformCategory category;

    private String name;
    private int price;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
