package com.example.asplatform.customer.service;

import com.example.asplatform.customer.domain.Customer;
import com.example.asplatform.customer.domain.CustomerAddress;
import com.example.asplatform.customer.dto.responseDTO.CustomerCardResponse;
import com.example.asplatform.customer.repository.CustomerAddressRepository;
import com.example.asplatform.customer.repository.CustomerRepository;
import com.example.asplatform.review.repository.ReviewAvg;
import com.example.asplatform.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerCardService {

    private final CustomerRepository customerRepository;
    private final CustomerAddressRepository addressRepository;
    private final ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public Page<CustomerCardResponse> listByFilters(
            String regionSi,
            String regionGu,
            Long   platformCategoryId, // 컨트롤러가 이걸 넘겨줌
            String keyword,
            Pageable pageable
    ) {
        // 정렬 제거(안전)
        Pageable p = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());

        Page<ReviewAvg> page = reviewRepository.findAvgPageDesc(
                blankToNull(regionSi),
                blankToNull(regionGu),
                platformCategoryId,
                blankToNull(keyword),
                p
        );

        List<Long> ids = page.getContent().stream().map(ReviewAvg::getCustomerId).toList();
        if (ids.isEmpty()) return Page.empty(p);

        Map<Long, Customer> customers = customerRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Customer::getId, c -> c));
        Map<Long, CustomerAddress> addresses = addressRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(CustomerAddress::getCustomerId, a -> a));
        Map<Long, Double> avg = page.getContent().stream()
                .collect(Collectors.toMap(ReviewAvg::getCustomerId,
                        r -> Optional.ofNullable(r.getAvgRating()).orElse(0.0)));

        List<CustomerCardResponse> content = new ArrayList<>(ids.size());
        for (Long id : ids) {
            Customer c = customers.get(id);
            CustomerAddress a = addresses.get(id);
            content.add(new CustomerCardResponse(
                    id,
                    c != null ? c.getCompanyName() : "(삭제됨)",
                    toRegion(a),
                    round1(avg.getOrDefault(id, 0.0))
            ));
        }
        return new PageImpl<>(content, p, page.getTotalElements());
    }

    private static String blankToNull(String s) { return (s == null || s.isBlank()) ? null : s; }
    private static String toRegion(CustomerAddress a) {
        if (a == null || a.getRoadAddress() == null) return "지역 미등록";
        String[] s = a.getRoadAddress().split("\\s+");
        return (s.length >= 2) ? s[0] + " " + s[1] : s[0];
    }
    private static double round1(double v) { return Math.round(v * 10.0) / 10.0; }
}
