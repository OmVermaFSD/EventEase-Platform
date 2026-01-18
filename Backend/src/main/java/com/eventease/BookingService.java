package com.eventease;

import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookingService {

    private final SeatRepository seatRepository;

    public BookingService(SeatRepository seatRepository) {
        this.seatRepository = seatRepository;
    }

    @Transactional(readOnly = true)
    public List<Seat> getAllSeats() {
        return seatRepository.findAll();
    }

    @Transactional
    public Seat bookSeat(Long id) {
        try {
            Seat seat = seatRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Seat not found: " + id));

            if (seat.isSold()) {
                throw new IllegalStateException("Seat already sold: " + id);
            }

            seat.setSold(true);
            return seatRepository.save(seat);
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new IllegalStateException("Seat was modified by another transaction: " + id, e);
        }
    }
}
