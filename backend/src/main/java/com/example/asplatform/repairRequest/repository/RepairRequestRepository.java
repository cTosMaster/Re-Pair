package com.example.asplatform.repairRequest.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.asplatform.common.enums.RepairStatus;
import com.example.asplatform.repairRequest.domain.RepairRequest;
import com.example.asplatform.repairRequest.dto.responseDTO.CustomerRepairRequestListDto;

@Repository
public interface RepairRequestRepository extends JpaRepository<RepairRequest, Long> {
	/**
	 * 로그인한 고객의 수리 요청 목록을 상태(status) 그룹과 키워드로 필터링하여 페이징 조회.
	 * 
	 * @param userId   로그인된 사용자 ID
	 * @param statuses 포함할 수리 상태 목록 (EnumSet)
	 * @param keyword  제목 또는 제품명에 포함된 키워드 (null 허용)
	 * @param pageable 페이징 정보
	 * @return 수리 요청 페이지
	 */
	@EntityGraph(attributePaths = { "repairableItem", "repairableItem.category", "user.id", "repairableItem.customer",
			"repairableItem.customer.companyName" }) // Lazy필드 강제로 EAGER처럼 JOIN
	@Query("""
			    SELECT r FROM RepairRequest r
			    WHERE r.user.id = :userId
			    AND r.status IN :statuses
			    AND r.isDeleted = false
			    AND (
			        :keyword IS NULL OR :keyword = ''
			        OR LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
			        OR LOWER(r.repairableItem.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
			    )
			""")
	Page<RepairRequest> findByUserIdAndStatusesWithKeyword(@Param("userId") Long userId,
			@Param("statuses") Set<RepairStatus> statuses, @Param("keyword") String keyword, Pageable pageable);

	/**
	 * 로그인한 수리기사의 할당된 수리 요청 목록을 상태와 키워드로 필터링하여 페이징 조회.
	 * 
	 * @param engineerId
	 * @param keyword
	 * @param pageable
	 * @return
	 */
	@Query("""
			select rr from RepairRequest rr
			  join fetch rr.user u
			  join fetch rr.repairableItem ri
			  join fetch ri.category c
			  join fetch ri.customer cu
			where rr.engineer.id = :engineerId
			  and rr.isDeleted = false
			  and (:status is null or rr.status = :status)
			  and (:categoryId is null or c.id = :categoryId)
			  and (
			      :keyword is null
			      or lower(rr.title) like lower(concat('%', :keyword, '%'))
			      or lower(u.name)   like lower(concat('%', :keyword, '%'))
			      or lower(ri.name)  like lower(concat('%', :keyword, '%'))
			  )
			""")
	Page<RepairRequest> findEngineerList(@Param("engineerId") Long engineerId, @Param("status") RepairStatus status,
			@Param("categoryId") Long categoryId, @Param("keyword") String keyword, Pageable pageable);

	/**
	 * 고객사에 해당하는 모든 수리 요청 목록 조회
	 * 
	 * @param userId
	 * @param keyword
	 * @param categoryId
	 * @param status
	 * @param pageable
	 * @return
	 */
	@Query(value = """
			select new com.example.asplatform.repairRequest.dto.responseDTO.CustomerRepairRequestListDto(
			  rr.id,
			  u.name,
			  rr.title,
			  rr.createdAt,
			  rr.status,
			  ri.name,
			  cat.name,
			  a.postalCode,
			  a.roadAddress,
			  a.detailAddress
			)
			from RepairRequest rr
			  join rr.user u
			  join u.address a
			  join rr.repairableItem ri
			  join ri.customer cust
			  join ri.category cat
			where cust.id = :customerId
			  and rr.isDeleted = false
			  and (:status     is null or rr.status = :status)
			  and (:categoryId is null or cat.id    = :categoryId)
			  and (
			       :keyword is null
			    or lower(rr.title) like lower(concat('%', :keyword, '%'))
			    or lower(u.name)   like lower(concat('%', :keyword, '%'))
			  )
			""", countQuery = """
			select count(rr.id)
			from RepairRequest rr
			  join rr.user u
			  join u.address a
			  join rr.repairableItem ri
			  join ri.customer cust
			  join ri.category cat
			where cust.id = :customerId
			  and rr.isDeleted = false
			  and (:status     is null or rr.status = :status)
			  and (:categoryId is null or cat.id    = :categoryId)
			  and (
			       :keyword is null
			    or lower(rr.title) like lower(concat('%', :keyword, '%'))
			    or lower(u.name)   like lower(concat('%', :keyword, '%'))
			  )
			""")
	Page<CustomerRepairRequestListDto> findCustomerList(@Param("customerId") Long userId,
			@Param("keyword") String keyword, // null 가능 // 가능
			@Param("categoryId") Long categoryId, // null 가능
			@Param("status") RepairStatus status, // null 가능
			Pageable pageable);

}
