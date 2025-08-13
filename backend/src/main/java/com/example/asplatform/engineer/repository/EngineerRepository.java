package com.example.asplatform.engineer.repository;

import com.example.asplatform.engineer.domain.Engineer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EngineerRepository extends JpaRepository<Engineer, Long> {
}
