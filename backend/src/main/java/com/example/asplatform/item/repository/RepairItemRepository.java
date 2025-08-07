package com.example.asplatform.item.repository;

import com.example.asplatform.item.domain.RepairItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RepairItemRepository extends JpaRepository<RepairItem, Long> {
    List<RepairItem> findByCustomerId(Long customerId);
}

