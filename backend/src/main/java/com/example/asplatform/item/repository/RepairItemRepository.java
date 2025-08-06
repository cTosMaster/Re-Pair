package com.example.asplatform.item.repository;

import com.example.asplatform.item.domain.RepairItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RepairItemRepository extends JpaRepository<RepairItem, Long> {
}