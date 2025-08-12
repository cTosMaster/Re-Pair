package com.example.asplatform.common.converter;

import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import com.example.asplatform.common.enums.RepairStatus;

@Component
public class RepairStatusConverter implements Converter<String, RepairStatus> {
  @Override
  public RepairStatus convert(String source) {
    if (source == null) return null;
    String s = source.trim();
    if (s.isEmpty()) return null;
    // 대소문자 무시
    return RepairStatus.valueOf(s.toUpperCase());
  }
}