package com.example.asplatform.stats.dto.responseDTO;

public record MonthlyChartSummary(
        String month,
        long totalRequests,
        long completedRequests,
        long unpaidRequests,
        double completionRate
) {}
