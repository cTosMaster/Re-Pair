package com.example.asplatform.repairRequest.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.asplatform.common.enums.RepairStatus;
import com.example.asplatform.repairRequest.domain.RepairRequest;

@Repository
public interface RepairRequestRepository extends JpaRepository<RepairRequest, Long> {
	/**
     * 로그인한 사용자의 수리 요청 목록을 상태(status) 그룹과 키워드로 필터링하여 페이징 조회.
     *
     * @param userId   로그인된 사용자 ID
     * @param statuses 포함할 수리 상태 목록 (EnumSet)
     * @param keyword  제목 또는 제품명에 포함된 키워드 (null 허용)
     * @param pageable 페이징 정보
     * @return 수리 요청 페이지
     */
	@EntityGraph(attributePaths = {
		    "repairableItem",
		    "repairableItem.category",
		    "user.id",
		    "repairableItem.customer",
		    "repairableItem.customer.companyName"
		}) //Lazy필드 강제로 EAGER처럼 JOIN
	@Query("""
		    SELECT r FROM RepairRequest r
		    WHERE r.user.id = :userId
		    AND r.status IN :statuses
		    AND (
		        :keyword IS NULL OR :keyword = ''
		        OR LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
		        OR LOWER(r.repairableItem.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
		    )
		""")
    Page<RepairRequest> findByUserIdAndStatusesWithKeyword(
            @Param("userId") Long userId,
            @Param("statuses") Set<RepairStatus> statuses,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
