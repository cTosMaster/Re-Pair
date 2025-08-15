package com.example.asplatform.repairRequest.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
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

	/**
	 * 삭제할 수 있는 대상 선별: - 내 customerId 소속 - 아직 삭제되지 않음 - 상태: CANCELED or COMPLETED
	 * 
	 * @param ids
	 * @param customerId
	 * @param allowed
	 * @return
	 */
	@Query("""
			    select r.id
			    from RepairRequest r
			    join r.repairableItem ri
			    join ri.customer c
			    where r.id in :ids
			      and c.id = :customerId
			      and r.isDeleted = false
			      and r.status in :allowed
			""")

	List<Long> findDeletableIds(@Param("ids") List<Long> ids, @Param("customerId") Long customerId,
			@Param("allowed") Collection<RepairStatus> allowed);

	/**
	 * 소프트 딜리트 실행 - JPQL bulk update에는 join을 안 쓰고, 위에서 선별된 id들만 업데이트
	 * 
	 * @param ids
	 * @param userId
	 * @param allowed
	 * @return
	 */
	@Modifying(clearAutomatically = true, flushAutomatically = true)
	@Query("""
			    update RepairRequest r
			       set r.isDeleted = true,
			           r.deletedAt = CURRENT_TIMESTAMP,
			           r.deletedBy = :userId
			     where r.id in :ids
			       and r.isDeleted = false
			       and r.status in :allowed
			""")
	int softDeleteByIds(@Param("ids") List<Long> ids, @Param("userId") Long userId,
			@Param("allowed") Collection<RepairStatus> allowed);

	/**
	 * 로그인한 엔지니어가 자신의 요청(requestId)을 작성 가능한 상태(수리대기)일 때만 조회 - 엔지니어 소유(= 배정됨) - 현재
	 * 상태가 WAITING_FOR_REPAIR - is_delete = false
	 * 
	 * @param requestId
	 * @param engineerId
	 * @param waiting
	 * @return
	 */
	@Query("""
			    select r
			      from RepairRequest r
			      where r.id = :requestId
			        and r.engineer.id = :engineerId
			        and r.status = :waiting
			        and r.isDeleted = false
			""")
	Optional<RepairRequest> findOwnedWaitingForRepair(@Param("requestId") Long requestId,
			@Param("engineerId") Long engineerId,
			@Param("waiting") RepairStatus waiting /* RepairStatus.WAITING_FOR_REPAIR */);

	boolean existsByEngineer_IdAndStatusIn(Long engineerId, Collection<RepairStatus> statuses);

	/**
	 * 수리 요청 상세 조회 - N+1 방지용 fetch join 메서드
	 * 
	 * @param id
	 * @return
	 */
	@Query("""
			  select rr from RepairRequest rr
			  left join fetch rr.user u
			  left join fetch u.address adr
			  left join fetch u.customer uc
			  left join fetch rr.engineer e
			  left join fetch rr.repairableItem ri
			  left join fetch ri.customer ric
			  left join fetch ri.category cat
			    where rr.requestId = :requestId
			""")
	Optional<RepairRequest> findByIdWithAllRelations(@Param("requestId") Long requestId);
	
	/**
	 * 수리 요청 조회 - N+1 방지용 fetch join 메서드
	 * 
	 * @param requestId
	 * @return
	 */
	@Query("""
			  select rr from RepairRequest rr
			  left join fetch rr.repairableItem ri
			  left join fetch ri.customer c
			  where rr.requestId = :requestId
			""")
			Optional<RepairRequest> findByIdWithItemAndCustomer(@Param("requestId") Long requestId);

}
