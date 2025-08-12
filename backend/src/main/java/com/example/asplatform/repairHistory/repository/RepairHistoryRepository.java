package com.example.asplatform.repairHistory.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.asplatform.repairHistory.domain.RepairHistory;

public interface RepairHistoryRepository extends JpaRepository<RepairHistory, Long> { }
