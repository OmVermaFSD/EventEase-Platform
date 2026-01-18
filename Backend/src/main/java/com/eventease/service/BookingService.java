package com.eventease.service;

import com.eventease.entity.Seat;
import com.eventease.entity.Seat.SeatStatus;
import com.eventease.exception.ConcurrencyConflictException;
import com.eventease.exception.SeatNotAvailableException;
import com.eventease.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
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
        log.debug("Retrieving seat map");
        return seatRepository.findAll();
    }
    
    @Transactional
    public Seat bookSeat(String seatId, String userId) {
        log.info("Attempting to book seat {} for user {}", seatId, userId);
        
        try {
            Optional<Seat> seatOpt = seatRepository.findById(seatId);
            if (seatOpt.isEmpty()) {
                throw new SeatNotAvailableException("Seat not found: " + seatId);
            }
            
            Seat seat = seatOpt.get();
            
            if (seat.getStatus() != SeatStatus.AVAILABLE) {
                log.warn("Seat {} is not available. Current status: {}", seatId, seat.getStatus());
                throw new SeatNotAvailableException("Seat " + seatId + " is not available. Status: " + seat.getStatus());
            }
            
            seat.setStatus(SeatStatus.SOLD);
            seat.setUserId(userId);
            
            Seat savedSeat = seatRepository.save(seat);
            log.info("Successfully booked seat {} for user {}", seatId, userId);
            return savedSeat;
            
        } catch (ObjectOptimisticLockingFailureException e) {
            log.error("Concurrency conflict when booking seat {} for user {}", seatId, userId, e);
            throw new ConcurrencyConflictException("Seat " + seatId + " was modified by another transaction. Please try again.");
        }
    }
    
    @Transactional(readOnly = true)
    public long getAvailableSeatsCount() {
        return seatRepository.countByStatus(SeatStatus.AVAILABLE);
    }
    
    @Transactional(readOnly = true)
    public List<Seat> getSeatsByUserId(String userId) {
        return seatRepository.findByUserId(userId);
    }
    
    @Transactional
    public void resetAllSeats() {
        log.info("Resetting all seats to AVAILABLE status");
        List<Seat> allSeats = seatRepository.findAll();
        
        allSeats.forEach(seat -> {
            seat.setStatus(SeatStatus.AVAILABLE);
            seat.setUserId(null);
        });
        
        seatRepository.saveAll(allSeats);
        log.info("FLASHSALE_RESET: {} Seats Released.", allSeats.size());
    }
}
