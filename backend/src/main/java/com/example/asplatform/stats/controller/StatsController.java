package com.example.asplatform.stats.controller;

import com.example.asplatform.stats.dto.responseDTO.*;
import com.example.asplatform.stats.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService stats;

    // 월별 총 요청 건수 / 요약(summary)
    // GET /api/stats/monthly
    // GET /api/stats/monthly?type=summary&month=YYYY-MM
    @GetMapping("/monthly")
    public ResponseEntity<?> monthly(@RequestParam(value = "type", required = false) String type,
                                     @RequestParam(value = "month", required = false) String month) {
        if ("summary".equalsIgnoreCase(type)) {
            var all = stats.monthlyChartSummary();
            if (month != null) return ResponseEntity.ok(all.stream().filter(s -> month.equals(s.month())).toList());
            return ResponseEntity.ok(all);
        }
        return ResponseEntity.ok(stats.monthlyTotal());
    }

    // 월별 완료 건수
    @GetMapping("/monthly/completed")
    public ResponseEntity<List<MonthlyCompletedResponse>> monthlyCompleted() {
        return ResponseEntity.ok(stats.monthlyCompleted());
    }

    // 월별 지표 종합 조회
    @GetMapping("/monthly/chart")
    public ResponseEntity<List<MonthlyChartSummary>> monthlyChart() {
        return ResponseEntity.ok(stats.monthlyChartSummary());
    }

    // 고객사별: 요청 건수 / 평균 별점
    // /api/stats/customer?customerId=3
    // /api/stats/customer?type=averageRating&customerId=3
    @GetMapping("/customer")
    public ResponseEntity<?> customer(@RequestParam Long customerId,
                                      @RequestParam(required = false) String type) {
        if ("averageRating".equalsIgnoreCase(type)) {
            return ResponseEntity.ok(stats.customerAverageRating(customerId));
        }
        return ResponseEntity.ok(stats.customerTotal(customerId));
    }

    // 고객사별 완료율
    @GetMapping("/customer/completion")
    public ResponseEntity<CustomerCompletionResponse> customerCompletion(@RequestParam Long customerId) {
        return ResponseEntity.ok(stats.customerCompletion(customerId));
    }

    // 요청 상세 처리 이력
    @GetMapping("/history/{requestId}")
    public ResponseEntity<List<HistoryEntryResponse>> history(@PathVariable Long requestId) {
        return ResponseEntity.ok(stats.history(requestId));
    }
}
