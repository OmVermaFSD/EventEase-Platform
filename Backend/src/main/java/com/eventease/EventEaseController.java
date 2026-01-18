package com.eventease;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
public class EventEaseController {

    private final BookingService bookingService;

    public EventEaseController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping({"/", ""})
    public List<Seat> getAllSeats() {
        return bookingService.getAllSeats();
    }

    @PostMapping("/book/{id}")
    public ResponseEntity<?> bookSeat(@PathVariable Long id) {
        try {
            Seat seat = bookingService.bookSeat(id);
            return ResponseEntity.ok(seat);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }
}
