package com.example.asplatform.repair.repository;

import com.example.asplatform.repair.domain.Repair;
import com.example.asplatform.repair.domain.RepairPresetUsage;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepairRepository extends JpaRepository<Repair, Long> {
    boolean existsByIdAndRequest_User_Id(Long repairId, Long userId);
    
    // 수리 요청 아이디 찾아서 조회하기 -> 최종 수리 견적에 사용
    Optional<Repair> findByRequest_requestId(Long request);

    List<Repair> findAllByDeletedFalse(); 
    
    // soft delete -> 최종 수리 견적에 사용하기
    Optional<Repair> findByIdAndDeletedFalse(Long id);
   
    
    //  사용자 -> 본인이 작성한 수리 견적서 조회
    Page<Repair> findByRequest_User_Id(Long userId, Pageable pageable);

    //  수리기사 / 고객사 관리자 -> 자신 고객사의 수리 견적서 조회
    Page<Repair> findByRequest_User_Customer_Id(Long customerId, Pageable pageable);
    
    
}
