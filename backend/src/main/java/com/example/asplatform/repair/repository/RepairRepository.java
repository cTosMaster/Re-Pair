package com.example.asplatform.repair.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.asplatform.repair.domain.Repair;

public interface RepairRepository extends JpaRepository<Repair, Long> {
    Optional<Repair> findByRequestId(Long requestId);
}
