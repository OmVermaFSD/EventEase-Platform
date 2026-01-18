package com.eventease.scheduler;

import com.eventease.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class FlashSaleScheduler {
    
    private final BookingService bookingService;
    
    @Scheduled(cron = "0 * * * * *")
    public void resetFlashSale() {
        log.info("Running scheduled flash sale reset (60-second interval)");
        try {
            bookingService.resetAllSeats();
        } catch (Exception e) {
            log.error("Error during scheduled flash sale reset", e);
        }
    }
}
