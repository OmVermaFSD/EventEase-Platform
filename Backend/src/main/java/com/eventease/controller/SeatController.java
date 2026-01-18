package com.eventease.controller;

import com.eventease.entity.Seat;
import com.eventease.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class SeatController {

    private final BookingService bookingService;

    @GetMapping("/seats")
    public ResponseEntity<java.util.List<Seat>> getAllSeats() {
        log.debug("Frontend requested seat map");
        return ResponseEntity.ok(bookingService.getSeatMap());
    }

    @PostMapping("/book/{seatId}")
    public ResponseEntity<?> bookSeat(@PathVariable String seatId, @RequestParam String userId) {
        try {
            Seat bookedSeat = bookingService.bookSeat(seatId, userId);
            log.info("Frontend successfully booked seat {} for user {}", seatId, userId);
            return ResponseEntity.ok(bookedSeat);
        } catch (Exception e) {
            log.error("Frontend booking failed for seat {} by user {}", seatId, userId, e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "seatId", seatId,
                "userId", userId
            ));
        }
    }
}
