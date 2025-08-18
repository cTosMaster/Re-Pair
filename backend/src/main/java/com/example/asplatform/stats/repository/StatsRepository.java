package com.example.asplatform.stats.repository;

import com.example.asplatform.repairRequest.domain.RepairRequest;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

public interface StatsRepository extends Repository<RepairRequest, Long> {

    @Query(value = """
        SELECT DATE_FORMAT(CONVERT_TZ(rr.created_at, '+00:00', '+09:00'), '%Y-%m') AS ym,
               COUNT(*) AS cnt
        FROM repair_requests rr
        JOIN repairable_items i ON i.item_id = rr.item_id AND i.is_deleted = FALSE
        WHERE rr.is_deleted = FALSE
        GROUP BY ym
        ORDER BY ym
        """, nativeQuery = true)
    List<Map<String,Object>> monthlyTotalRequests();

    @Query(value = """
        SELECT DATE_FORMAT(CONVERT_TZ(rr.created_at, '+00:00', '+09:00'), '%Y-%m') AS ym,
               SUM(rr.status = 'COMPLETED') AS completed_cnt
        FROM repair_requests rr
        JOIN repairable_items i ON i.item_id = rr.item_id AND i.is_deleted = FALSE
        WHERE rr.is_deleted = FALSE
        GROUP BY ym
        ORDER BY ym
        """, nativeQuery = true)
    List<Map<String,Object>> monthlyCompletedRequests();

    @Query(value = """
        WITH base AS (
          SELECT rr.request_id,
                 DATE_FORMAT(CONVERT_TZ(rr.created_at, '+00:00', '+09:00'), '%Y-%m') AS ym,
                 (rr.status = 'COMPLETED') AS is_completed
          FROM repair_requests rr
          JOIN repairable_items i ON i.item_id = rr.item_id AND i.is_deleted = FALSE
          WHERE rr.is_deleted = FALSE
        ),
        paid AS (
          SELECT r.request_id, MAX(p.status = 'DONE') AS has_done
          FROM repairs r
          LEFT JOIN payments p ON p.repair_id = r.repair_id
          GROUP BY r.request_id
        )
        SELECT b.ym,
               COUNT(*) AS total_requests,
               SUM(b.is_completed) AS completed_requests,
               SUM(CASE WHEN COALESCE(p.has_done, 0) = 0 THEN 1 ELSE 0 END) AS unpaid_requests
        FROM base b
        LEFT JOIN paid p ON p.request_id = b.request_id
        GROUP BY b.ym
        ORDER BY b.ym
        """, nativeQuery = true)
    List<Map<String,Object>> monthlySummary();

    @Query(value = """
        SELECT COUNT(*)
        FROM repair_requests rr
        JOIN repairable_items i ON i.item_id = rr.item_id AND i.is_deleted = FALSE
        WHERE rr.is_deleted = FALSE
          AND i.customer_id = :cid
        """, nativeQuery = true)
    long customerTotalRequests(@Param("cid") Long customerId);

    @Query(value = """
        SELECT (SUM(rr.status = 'COMPLETED') * 1.0 / COUNT(*))
        FROM repair_requests rr
        JOIN repairable_items i ON i.item_id = rr.item_id AND i.is_deleted = FALSE
        WHERE rr.is_deleted = FALSE
          AND i.customer_id = :cid
        """, nativeQuery = true)
    Double customerCompletionRate(@Param("cid") Long customerId);

    @Query(value = """
        SELECT AVG(rv.rating)
        FROM reviews rv
        JOIN repairs r  ON r.repair_id  = rv.repair_id
        JOIN repair_requests rr ON rr.request_id = r.request_id
        JOIN repairable_items i ON i.item_id    = rr.item_id AND i.is_deleted = FALSE
        WHERE rr.is_deleted = FALSE
          AND i.customer_id = :cid
        """, nativeQuery = true)
    Double customerAverageRating(@Param("cid") Long customerId);

    @Query(value = """
        SELECT history_id, request_id, changed_by, previous_status, new_status, changed_at, memo
        FROM repair_history
        WHERE request_id = :rid
        ORDER BY changed_at ASC
        """, nativeQuery = true)
    List<Map<String,Object>> historyByRequest(@Param("rid") Long requestId);
}
