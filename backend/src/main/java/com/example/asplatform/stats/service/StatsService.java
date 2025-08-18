package com.example.asplatform.stats.service;

import com.example.asplatform.stats.dto.responseDTO.*;
import com.example.asplatform.stats.repository.StatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final StatsRepository repo;

    public List<MonthlyCountResponse> monthlyTotal() {
        return repo.monthlyTotalRequests().stream()
                .map(r -> new MonthlyCountResponse(
                        (String) r.get("ym"),
                        ((Number) r.get("cnt")).longValue()
                )).toList();
    }

    public List<MonthlyCompletedResponse> monthlyCompleted() {
        return repo.monthlyCompletedRequests().stream()
                .map(r -> new MonthlyCompletedResponse(
                        (String) r.get("ym"),
                        ((Number) r.get("completed_cnt")).longValue()
                )).toList();
    }

    public List<MonthlyChartSummary> monthlyChartSummary() {
        return repo.monthlySummary().stream().map(r -> {
            String m = (String) r.get("ym");
            long total = ((Number) r.get("total_requests")).longValue();
            long completed = ((Number) r.get("completed_requests")).longValue();
            long unpaid = ((Number) r.get("unpaid_requests")).longValue();
            double rate = (total == 0) ? 0.0 : (completed * 1.0 / total);
            return new MonthlyChartSummary(m, total, completed, unpaid, rate);
        }).toList();
    }

    public CustomerCountResponse customerTotal(Long customerId) {
        return new CustomerCountResponse(customerId, repo.customerTotalRequests(customerId));
    }

    public CustomerCompletionResponse customerCompletion(Long customerId) {
        Double rate = repo.customerCompletionRate(customerId);
        return new CustomerCompletionResponse(customerId, rate == null ? 0.0 : rate);
    }

    public CustomerAverageRatingResponse customerAverageRating(Long customerId) {
        return new CustomerAverageRatingResponse(customerId, repo.customerAverageRating(customerId));
    }

    public List<HistoryEntryResponse> history(Long requestId) {
        return repo.historyByRequest(requestId).stream().map(r ->
                new HistoryEntryResponse(
                        ((Number) r.get("history_id")).longValue(),
                        ((Number) r.get("request_id")).longValue(),
                        r.get("changed_by") == null ? null : ((Number) r.get("changed_by")).longValue(),
                        (String) r.get("previous_status"),
                        (String) r.get("new_status"),
                        r.get("changed_at").toString(),
                        (String) r.get("memo")
                )
        ).toList();
    }
}
