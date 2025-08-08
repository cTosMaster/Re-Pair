package com.example.asplatform.engineer.service;

import com.example.asplatform.engineer.domain.Engineer;
import com.example.asplatform.engineer.dto.requestDTO.EngineerRequest;
import com.example.asplatform.engineer.dto.requestDTO.ReassignEngineerRequest;
import com.example.asplatform.engineer.dto.requestDTO.UpdateEngineerRequest;
import com.example.asplatform.engineer.dto.responseDTO.EngineerResponse;
import com.example.asplatform.engineer.repository.EngineerRepository;
import com.example.asplatform.user.domain.User;
import com.example.asplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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

    /** 수리기사 등록 */
    public void createEngineer(EngineerRequest dto) {
        Engineer engineer = Engineer.builder()
                .userId(dto.getUserId())
                .customerId(dto.getCustomerId())
                .assigned(false)
                .build();
        engineerRepository.save(engineer);
    }

    /** 수리기사 재배정 (isAssigned 상태 변경) */
    public void reassignEngineer(Long engineerId, ReassignEngineerRequest dto) {
        Engineer engineer = engineerRepository.findById(engineerId)
                .orElseThrow(() -> new IllegalArgumentException("수리기사 없음: " + engineerId));
        engineer.setAssigned(dto.isAssigned());
        // 트랜잭션 내에서 변경 감지로 자동 업데이트
    }

    /** 수리기사 삭제 */
    public void deleteEngineer(Long engineerId) {
        engineerRepository.deleteById(engineerId);
    }

    /** 수리기사 상세 조회 */
    @Transactional(readOnly = true)
    public EngineerResponse getEngineer(Long engineerId) {
        Engineer eng = engineerRepository.findById(engineerId)
                .orElseThrow(() -> new IllegalArgumentException("수리기사 없음: " + engineerId));
        return EngineerResponse.from(eng);
    }

    /** 전체 수리기사 목록 조회 */
    @Transactional(readOnly = true)
    public List<EngineerResponse> getAllEngineers() {
        return engineerRepository.findAll().stream()
                .map(EngineerResponse::from)
                .collect(Collectors.toList());
    }

    /** 고객사 ID로 소속 기사 조회 */
    @Transactional(readOnly = true)
    public List<EngineerResponse> getByCustomerId(Long customerId) {
        return engineerRepository.findByCustomerId(customerId).stream()
                .map(EngineerResponse::from)
                .collect(Collectors.toList());
    }

    /** 로그인된 유저 ID로 내 기사 정보 조회 */
    @Transactional(readOnly = true)
    public EngineerResponse getMyEngineer(Long userId) {
        Engineer eng = engineerRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저의 기사 정보가 없습니다: " + userId));
        return EngineerResponse.from(eng);
    }
    // 수리기사 이름,이메일,전화번호 수정
    public void updateEngineer(Long engineerId, UpdateEngineerRequest dto) {
        // 1) Engineer 조회 (없으면 예외)
        Engineer eng = engineerRepository.findById(engineerId)
                .orElseThrow(() -> new IllegalArgumentException("수리기사 없음: " + engineerId));

        // 2) 그 엔지니어에 매핑된 User 조회
        Long userId = eng.getUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음: " + userId));

        // 3) User 필드 업데이트
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        // (변경 감지로 트랜잭션 커밋 시 자동 반영)
    }
}
