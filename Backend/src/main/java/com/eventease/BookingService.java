package com.eventease;

import com.eventease.Seat.SeatStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {
    
    private final SeatRepository seatRepository;
    
    @Transactional(readOnly = true)
    public List<Seat> getSeatMap() {
        return seatRepository.findAll();
    }
    
    @Transactional
    public Seat bookSeat(String seatId, String userId) {
        try {
            Optional<Seat> seatOpt = seatRepository.findById(seatId);
            if (seatOpt.isEmpty()) {
                throw new RuntimeException("Seat not found: " + seatId);
            }
            
            Seat seat = seatOpt.get();
            if (seat.getStatus() != SeatStatus.AVAILABLE) {
                throw new RuntimeException("Seat " + seatId + " is not available");
            }
            
            seat.setStatus(SeatStatus.SOLD);
            seat.setUserId(userId);
            
            return seatRepository.save(seat);
            
        } catch (ObjectOptimisticLockingFailureException e) {
            // CRITICAL: Throw custom exception for 409 response
            throw new ConcurrencyException("Seat " + seatId + " was modified by another transaction");
        }
    }
    
    @Transactional
    @Scheduled(cron = "0 * * * * *")  // Every 60 seconds
    public void resetAllSeats() {
        log.info("FLASHSALE_RESET: Resetting all seats");
        List<Seat> allSeats = seatRepository.findAll();
        allSeats.forEach(seat -> {
            seat.setStatus(SeatStatus.AVAILABLE);
            seat.setUserId(null);
        });
        seatRepository.saveAll(allSeats);
    }
    
    public SeatRepository getSeatRepository() {
        return seatRepository;
    }
}
