// src/main/java/com/example/asplatform/admin/service/PlatformCategoryService.java
package com.example.asplatform.admin.service;

import com.example.asplatform.admin.domain.PlatformCategory;
import com.example.asplatform.admin.dto.PlatformCategoryCreateRequest;
import com.example.asplatform.admin.dto.PlatformCategoryDto;
import com.example.asplatform.admin.dto.PlatformCategoryUpdateRequest;
import com.example.asplatform.admin.repository.PlatformCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PlatformCategoryService {
    private final PlatformCategoryRepository repository;

    /** 전체 조회 */
    @Transactional(readOnly = true)
    public Page<PlatformCategoryDto> findAll(Pageable pageable) {
        return repository.findAll(pageable)
                .map(this::toDto);
    }

    /** 생성 */
    @Transactional
    public PlatformCategoryDto create(PlatformCategoryCreateRequest request) {
        if (repository.existsByName(request.getName())) {
            throw new IllegalArgumentException("이미 존재하는 카테고리 이름입니다.");
        }
        PlatformCategory entity = PlatformCategory.builder()
                .name(request.getName())
                .build();
        PlatformCategory saved = repository.save(entity);
        return toDto(saved);
    }

    /** 수정 */
    @Transactional
    public PlatformCategoryDto update(Long id, PlatformCategoryUpdateRequest request) {
        PlatformCategory entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다. id=" + id));
        entity.setName(request.getName());
        return toDto(entity);
    }

    /** 삭제 */
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("카테고리를 찾을 수 없습니다. id=" + id);
        }
        repository.deleteById(id);
    }

    private PlatformCategoryDto toDto(PlatformCategory e) {
        return PlatformCategoryDto.builder()
                .categoryId(e.getCategoryId())
                .name(e.getName())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
