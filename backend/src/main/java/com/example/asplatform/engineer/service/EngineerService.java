package com.example.asplatform.engineer.service;

import com.example.asplatform.common.enums.Role;
import com.example.asplatform.customer.domain.Customer;
import com.example.asplatform.customer.repository.CustomerRepository;
import com.example.asplatform.engineer.domain.Engineer;
import com.example.asplatform.engineer.dto.requestDTO.EngineerRequest;
import com.example.asplatform.engineer.dto.requestDTO.UpdateEngineerRequest;
import com.example.asplatform.engineer.dto.responseDTO.EngineerResponse;
import com.example.asplatform.engineer.repository.EngineerRepository;
import com.example.asplatform.user.domain.User;
import com.example.asplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class EngineerService {

    private final EngineerRepository engineerRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 수리기사 등록
     * - 매핑/소유권 검증 없음: 요청의 customerId를 그대로 사용
     * - users(ROLE=ENGINEER) 생성 후 engineers(engineer_id=user.id, customer_id) 생성
     */
    public EngineerResponse createEngineer(EngineerRequest req) {
        // 0) customerId 필수 + 존재 확인
        if (req.getCustomerId() == null) {
            throw new IllegalArgumentException("customerId는 필수입니다.");
        }
        Customer customer = customerRepository.findById(req.getCustomerId())
                .orElseThrow(() -> new IllegalArgumentException("고객사를 찾을 수 없습니다. id=" + req.getCustomerId()));

        // 1) 이메일 중복 체크
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        // 2) users 생성 (ROLE=ENGINEER)
        User user = User.builder()
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .name(req.getName())
                .phone(req.getPhone())
                .role(Role.ENGINEER)
                .isActive(true)
                .build();
        userRepository.save(user); // user.id 확정

        // 3) engineers 생성 (engineer_id = users.id)
        Engineer engineer = Engineer.builder()
                .userId(user.getId())     // PK (= users.id)
                .customerId(customer.getId())
                .assigned(false)
                .build();
        engineerRepository.save(engineer);

        return EngineerResponse.from(engineer);
    }

    /** 수리기사 기본 정보 수정 (이름/이메일/전화) */
    public void updateEngineer(Long engineerId, UpdateEngineerRequest dto) {
        Engineer eng = engineerRepository.findById(engineerId)
                .orElseThrow(() -> new IllegalArgumentException("수리기사를 찾을 수 없습니다. id=" + engineerId));

        // Engineer PK = users.id → 동일 ID로 User 조회
        User user = userRepository.findById(engineerId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. id=" + engineerId));

        // 이메일 변경 시 중복 체크
        if (dto.getEmail() != null && !dto.getEmail().equals(user.getEmail())
                && userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        if (dto.getName()  != null) user.setName(dto.getName());
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        // @Transactional 더티체킹으로 자동 반영
    }

    /** 수리기사 삭제 (Engineer만 삭제. User 처리 정책은 선택) */
    public void deleteEngineer(Long engineerId) {
        Engineer eng = engineerRepository.findById(engineerId)
                .orElseThrow(() -> new IllegalArgumentException("수리기사를 찾을 수 없습니다. id=" + engineerId));
        engineerRepository.delete(eng);

        // 필요 정책에 따라:
        // userRepository.deleteById(engineerId);
        // 또는 userRepository.findById(engineerId).ifPresent(u -> u.setIsActive(false));
    }

    /** 수리기사 단건 조회 */
    @Transactional(readOnly = true)
    public EngineerResponse getEngineer(Long engineerId) {
        Engineer eng = engineerRepository.findById(engineerId)
                .orElseThrow(() -> new IllegalArgumentException("수리기사를 찾을 수 없습니다. id=" + engineerId));
        return EngineerResponse.from(eng);
    }

    /** 수리기사 목록 (페이징) */
    @Transactional(readOnly = true)
    public Page<EngineerResponse> getEngineers(Pageable pageable) {
        return engineerRepository.findAll(pageable).map(EngineerResponse::from);
    }
}
