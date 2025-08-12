package com.example.asplatform.repairRequest.repository;

import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.asplatform.common.enums.RepairStatus;
import com.example.asplatform.repairRequest.domain.RepairRequest;
import com.example.asplatform.repairRequest.dto.responseDTO.CustomerRepairRequestListDto;

@Repository
public interface RepairRequestRepository extends JpaRepository<RepairRequest, Long> {

    /** 유저 마이페이지 목록 */
    @EntityGraph(attributePaths = {
        "repairableItem",
        "repairableItem.category",
        "repairableItem.customer",
        "user"
    })
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
    Page<RepairRequest> findByUserIdAndStatusesWithKeyword(
        @Param("userId") Long userId,
        @Param("statuses") Set<RepairStatus> statuses,
        @Param("keyword") String keyword,
        Pageable pageable
    );

    /** 엔지니어 마이페이지 목록 */
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
    Page<RepairRequest> findEngineerList(
        @Param("engineerId") Long engineerId,
        @Param("status") RepairStatus status,
        @Param("categoryId") Long categoryId,
        @Param("keyword") String keyword,
        Pageable pageable
    );

    /** 고객사 대시보드 목록 (DTO 프로젝션) */
    @Query(value = """
        select new com.example.asplatform.repairRequest.dto.responseDTO.CustomerRepairRequestListDto(
          rr.requestId,
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
        """,
        countQuery = """
        select count(rr)
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
    Page<CustomerRepairRequestListDto> findCustomerList(
        @Param("customerId") Long customerId,
        @Param("keyword") String keyword,
        @Param("categoryId") Long categoryId,
        @Param("status") RepairStatus status,
        Pageable pageable
    );
}
