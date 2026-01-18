package com.eventease.controller;

import com.eventease.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {
    
    private final BookingService bookingService;
    private boolean flashSaleEnabled = false;
    
    @PostMapping("/reset")
    public ResponseEntity<Map<String, Object>> resetSeats() {
        log.info("Manual reset triggered by admin");
        bookingService.resetAllSeats();
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "All seats have been reset to AVAILABLE");
        response.put("timestamp", LocalDateTime.now());
        response.put("availableSeats", bookingService.getAvailableSeatsCount());
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/start")
    public ResponseEntity<Map<String, Object>> startFlashSale() {
        log.info("Flash sale manually started by admin");
        this.flashSaleEnabled = true;
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Flash sale has been started");
        response.put("timestamp", LocalDateTime.now());
        response.put("enabled", flashSaleEnabled);
        response.put("availableSeats", bookingService.getAvailableSeatsCount());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/transactions")
    public ResponseEntity<List<Map<String, Object>>> getTransactions() {
        log.debug("Retrieving transaction logs for admin dashboard");
        
        List<Map<String, Object>> transactions = new ArrayList<>();
        
        transactions.add(Map.of(
            "id", "TXN001",
            "seatId", "A1",
            "userId", "user123",
            "amount", 150.00,
            "timestamp", LocalDateTime.now().minusMinutes(5),
            "status", "COMPLETED"
        ));
        
        transactions.add(Map.of(
            "id", "TXN002",
            "seatId", "B2",
            "userId", "user456",
            "amount", 120.00,
            "timestamp", LocalDateTime.now().minusMinutes(3),
            "status", "COMPLETED"
        ));
        
        transactions.add(Map.of(
            "id", "TXN003",
            "seatId", "C3",
            "userId", "user789",
            "amount", 180.00,
            "timestamp", LocalDateTime.now().minusMinutes(1),
            "status", "PENDING"
        ));
        
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSystemStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("flashSaleEnabled", flashSaleEnabled);
        status.put("availableSeats", bookingService.getAvailableSeatsCount());
        status.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.ok(status);
    }
}
