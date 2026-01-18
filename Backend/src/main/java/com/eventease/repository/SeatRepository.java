package com.eventease.repository;

import com.eventease.entity.Seat;
import com.eventease.entity.Seat.SeatStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, String> {
    
    long countByStatus(SeatStatus status);
    
    List<Seat> findByStatus(SeatStatus status);
    
    @Query("SELECT s FROM Seat s WHERE s.userId = :userId")
    List<Seat> findByUserId(@Param("userId") String userId);
    
    @Query("SELECT COUNT(s) FROM Seat s WHERE s.status != :status")
    long countByStatusNot(@Param("status") SeatStatus status);
}
