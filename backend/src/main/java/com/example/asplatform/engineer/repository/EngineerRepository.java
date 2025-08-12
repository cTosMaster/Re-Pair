package com.example.asplatform.engineer.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.asplatform.engineer.domain.Engineer;

public interface EngineerRepository extends JpaRepository<Engineer, Long> { }
