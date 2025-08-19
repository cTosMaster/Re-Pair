package com.example.asplatform.repair.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.asplatform.repair.domain.RepairPresetUsage;

@Repository
public interface RepairPresetUsageRepository extends JpaRepository<RepairPresetUsage, Long> {
	 List<RepairPresetUsage> findByRepair_Id(Long repairId);
	 
	// repairId 기준으로 모든 프리셋 사용 기록 삭제하기 
	void deleteAllByRepair_Id(Long repairId);
	    
    @Query("""
    	      select u from RepairPresetUsage u
    	      left join fetch u.preset p
    	      where u.repair.id = :repairId
    	      order by u.id asc
    	    """)
    	    List<RepairPresetUsage> findByRepair_IdWithPreset(@Param("repairId") Long repairId);

}
