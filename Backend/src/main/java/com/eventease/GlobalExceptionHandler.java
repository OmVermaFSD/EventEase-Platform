package com.eventease;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ConcurrencyException.class)
    public ResponseEntity<Map<String, String>> handleConcurrencyException(ConcurrencyException e) {
        log.warn("Concurrency conflict detected: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.CONFLICT)  // HTTP 409
                .body(Map.of(
                    "error", "CONFLICT",
                    "message", e.getMessage(),
                    "code", "409"
                ));
    }
    
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException e) {
        log.error("Runtime error: {}", e.getMessage(), e);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                    "error", "BAD_REQUEST",
                    "message", e.getMessage(),
                    "code", "400"
                ));
    }
}
