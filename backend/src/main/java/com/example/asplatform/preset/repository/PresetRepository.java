package com.example.asplatform.preset.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.asplatform.preset.domain.Preset;

@Repository
public interface PresetRepository extends JpaRepository<Preset , Long> {
	List<Preset> findByCategory_CategoryIdAndItem_ItemId(Long categoryId , Long itemId);

}
