package com.eventease;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class EventEaseController {

    private final BookingService bookingService;

    @GetMapping("/seats")
    public ResponseEntity<java.util.List<Seat>> getAllSeats() {
        return ResponseEntity.ok(bookingService.getSeatMap());
    }

    @PostMapping("/book/{seatId}")
    public ResponseEntity<?> bookSeat(@PathVariable String seatId, @RequestParam String userId) {
        try {
            Seat bookedSeat = bookingService.bookSeat(seatId, userId);
            return ResponseEntity.ok(bookedSeat);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage(),
                "seatId", seatId,
                "userId", userId
            ));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(Map.of(
            "availableSeats", bookingService.getSeatRepository().countByStatus(Seat.SeatStatus.AVAILABLE),
            "totalSeats", 100,
            "rateLimit", "10 requests/minute per IP"
        ));
    }
}
