package com.example.asplatform.repair.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.asplatform.repair.domain.RepairableItem;

@Repository
public interface RepairableItemRepository extends JpaRepository<RepairableItem, Long>{

	//제품 id로 제품 조회하기
	Optional<RepairableItem> findById(Long id);
}
