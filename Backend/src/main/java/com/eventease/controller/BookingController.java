package com.eventease.controller;

import com.eventease.entity.Seat;
import com.eventease.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/booking")
@RequiredArgsConstructor
@Slf4j
public class BookingController {
    
    private final BookingService bookingService;
    
    @GetMapping("/seats")
    public ResponseEntity<List<Seat>> getSeatMap() {
        log.debug("Seat map requested");
        return ResponseEntity.ok(bookingService.getSeatMap());
    }
    
    @PostMapping("/book/{seatId}")
    public ResponseEntity<?> bookSeat(@PathVariable String seatId, @RequestParam String userId) {
        try {
            Seat bookedSeat = bookingService.bookSeat(seatId, userId);
            log.info("Seat {} successfully booked for user {}", seatId, userId);
            return ResponseEntity.ok(bookedSeat);
        } catch (Exception e) {
            log.error("Failed to book seat {} for user {}", seatId, userId, e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "seatId", seatId,
                "userId", userId
            ));
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Seat>> getUserBookings(@PathVariable String userId) {
        log.debug("Retrieving bookings for user {}", userId);
        return ResponseEntity.ok(bookingService.getSeatsByUserId(userId));
    }
    
    @GetMapping("/available-count")
    public ResponseEntity<Map<String, Long>> getAvailableSeatsCount() {
        long count = bookingService.getAvailableSeatsCount();
        return ResponseEntity.ok(Map.of("availableSeats", count));
    }
}
