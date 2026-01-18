package com.eventease;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EventEaseApplication {

    public static void main(String[] args) {
        SpringApplication.run(EventEaseApplication.class, args);
    }
}
