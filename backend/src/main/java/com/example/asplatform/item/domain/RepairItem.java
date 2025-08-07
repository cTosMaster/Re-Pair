package com.example.asplatform.item.domain;

import com.example.asplatform.customer.domain.Customer;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
@Entity
@Table(name = "repairable_items")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RepairItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemId;

    private Long customerId;

    private Long categoryId; // 👉 customer_categories 기준

    private String name;

    private Integer price;

    private LocalDateTime createdAt;
}
