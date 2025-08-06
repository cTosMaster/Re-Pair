package com.example.asplatform.engineer.service;

import com.example.asplatform.customer.domain.Customer;
import com.example.asplatform.customer.repository.CustomerRepository;
import com.example.asplatform.engineer.domain.Engineer;
import com.example.asplatform.engineer.dto.requestDTO.EngineerUpdateRequestDto;
import com.example.asplatform.engineer.dto.responseDTO.EngineerResponseDto;
import com.example.asplatform.engineer.repository.EngineerRepository;
import com.example.asplatform.user.domain.User;
import com.example.asplatform.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EngineerService {

    private final EngineerRepository engineerRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;

    /**
     * 관리자 승인 하에 기존 유저를 수리기사로 등록
     * 추후 user,customer 생성시 고칠 것.
     */
    public Long registerEngineer(Long userId, Long customerId) {
        // 유저 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저가 존재하지 않습니다."));

        // 고객사 조회
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("고객사가 존재하지 않습니다."));

        // 엔지니어 생성
        Engineer engineer = Engineer.builder()
                .user(user)
                .customer(customer)
                .isAssigned(false)
                .assignedAt(null)
                .build();

        engineerRepository.save(engineer);
        return engineer.getId();
    }

    public EngineerResponseDto getEngineer(Long engineerId) {
        Engineer engineer = engineerRepository.findById(engineerId)
                .orElseThrow(() -> new EntityNotFoundException("수리기사가 존재하지 않습니다."));
        return EngineerResponseDto.from(engineer);
    }

    @Transactional
    public void updateEngineer(Long engineerId, EngineerUpdateRequestDto dto) {
        Engineer engineer = engineerRepository.findById(engineerId)
                .orElseThrow(() -> new EntityNotFoundException("수리기사가 존재하지 않습니다."));

        if (dto.getIsAssigned() != null) {
            engineer.setIsAssigned(dto.getIsAssigned());
        }

        if (dto.getAssignedAt() != null) {
            engineer.setAssignedAt(dto.getAssignedAt());
        }

        if (dto.getCustomerId() != null) {
            Customer customer = customerRepository.findById(dto.getCustomerId())
                    .orElseThrow(() -> new EntityNotFoundException("고객사가 존재하지 않습니다."));
            engineer.setCustomer(customer);
        }
    }

    @Transactional
    public void deleteEngineer(Long engineerId) {
        engineerRepository.deleteById(engineerId);
    }

    public List<EngineerResponseDto> getAllEngineers() {
        return engineerRepository.findAll().stream()
                .map(EngineerResponseDto::from)
                .collect(Collectors.toList());
    }
}
