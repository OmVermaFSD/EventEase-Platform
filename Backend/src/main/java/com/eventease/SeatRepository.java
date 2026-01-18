package com.eventease;

import com.eventease.Seat.SeatStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, String> {
    long countByStatus(SeatStatus status);
    List<Seat> findByStatus(SeatStatus status);
    List<Seat> findByUserId(String userId);
}
