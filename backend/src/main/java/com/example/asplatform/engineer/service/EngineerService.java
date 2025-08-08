package com.example.asplatform.engineer.service;

import com.example.asplatform.customer.domain.Customer;
import com.example.asplatform.customer.repository.CustomerRepository;
import com.example.asplatform.engineer.domain.Engineer;
import com.example.asplatform.engineer.dto.requestDTO.EngineerRequest;
import com.example.asplatform.engineer.dto.responseDTO.EngineerResponse;
import com.example.asplatform.engineer.dto.responseDTO.EngineerStatusResponse;
import com.example.asplatform.engineer.repository.EngineerRepository;
import com.example.asplatform.user.domain.User;
import com.example.asplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EngineerService {
    private final EngineerRepository engineerRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;

    // 수리기사 등록
    public void registerEngineer(EngineerRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new IllegalArgumentException("고객사 없음"));

        Engineer engineer = new Engineer(user, customer); // 생성자 따로 추가 필요 시 추가
        engineerRepository.save(engineer);
    }

    // 수리기사 삭제
    public void deleteEngineer(Long engineerId) {
        engineerRepository.deleteById(engineerId);
    }

    //수리기사 상세 조회
    public EngineerResponse getEngineer(Long engineerId) {
        Engineer engineer = engineerRepository.findById(engineerId)
                .orElseThrow(() -> new IllegalArgumentException("기사 없음"));
        return toResponse(engineer);
    }

    //수리기사 전체 조회
    public List<EngineerResponse> getAllEngineers() {
        return engineerRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private EngineerResponse toResponse(Engineer engineer) {
        return EngineerResponse.builder()
                .id(engineer.getId())
                .name(engineer.getUser().getName())
                .email(engineer.getUser().getEmail())
                .phone(engineer.getUser().getPhone())
                .isAssigned(engineer.isAssigned())
                .assignedAt(engineer.getAssignedAt())
                .customerId(engineer.getCustomer().getId())   // 고객사 id
                .customerName(engineer.getCustomer().getCompanyName())
                .build();
    }

    public Page<EngineerStatusResponse> getRepairsByEngineer(Long engineerId, String status, Pageable pageable) {
        // 1. engineerId로 배정된 repair_request 조회
        // 2. status가 있으면 필터링
        // 3. Page<RepairRequest> → Page<RepairSummaryResponse> 변환
        return null;
    }

}