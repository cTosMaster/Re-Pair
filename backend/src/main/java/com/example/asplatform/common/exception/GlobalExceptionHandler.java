package com.example.asplatform.common.exception;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
	 @ExceptionHandler(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class)
	  public ResponseEntity<Map<String, Object>> handleEnumMismatch(
	      org.springframework.web.method.annotation.MethodArgumentTypeMismatchException ex) {

	    if (ex.getRequiredType() != null 
	        && ex.getRequiredType().isEnum()
	        && "status".equals(ex.getName())) {

	      Object[] constants = ex.getRequiredType().getEnumConstants();
	      List<String> allowed = java.util.Arrays.stream(constants)
	          .map(Object::toString).toList();

	      Map<String, Object> body = new java.util.LinkedHashMap<>();
	      body.put("error", "INVALID_STATUS");
	      body.put("message", "status 파라미터가 올바르지 않습니다.");
	      body.put("provided", ex.getValue());
	      body.put("allowed", allowed);
	      return ResponseEntity.badRequest().body(body);
	    }
	    
	    // 그 외는 기본 400
	    return ResponseEntity.badRequest()
	        .body(java.util.Map.of("error","BAD_REQUEST","message", ex.getMessage()));
	  }
}
