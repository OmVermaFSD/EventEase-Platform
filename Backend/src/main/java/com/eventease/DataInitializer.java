package com.eventease;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final SeatRepository seatRepository;

    public DataInitializer(SeatRepository seatRepository) {
        this.seatRepository = seatRepository;
    }

    @Override
    public void run(String... args) {
        if (seatRepository.count() != 0) {
            return;
        }

        List<Seat> seats = new ArrayList<>(50);
        for (long i = 1; i <= 50; i++) {
            Seat seat = new Seat();
            seat.setId(i);
            seat.setSeatNumber("Seat A" + i);
            seat.setSold(false);
            seats.add(seat);
        }

        seatRepository.saveAll(seats);
        log.info("SEEDED DATABASE");
    }
}
