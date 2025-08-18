package com.example.asplatform.repair.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.asplatform.repair.domain.RepairImage;
import com.example.asplatform.repair.domain.RepairPresetUsage;

@Repository
public interface RepairImageRepository extends JpaRepository<RepairImage , Long>{

	List<RepairImage> findByRepair_Id(Long repairId);
	
	// repairId 기준으로 모든 프리셋 사용 기록 삭제하기 
    void deleteAllByRepair_Id(Long repairId);
    
   
	
}
