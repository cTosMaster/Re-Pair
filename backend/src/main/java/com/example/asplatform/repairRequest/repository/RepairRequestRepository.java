// src/main/java/com/example/asplatform/repairrequest/repository/RepairRequestRepository.java
package com.example.asplatform.repairRequest.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.asplatform.repairRequest.domain.RepairRequest;

public interface RepairRequestRepository extends JpaRepository<RepairRequest, Long> { }
