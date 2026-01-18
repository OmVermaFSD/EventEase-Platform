package com.eventease;

// Custom exception for concurrency conflicts
public class ConcurrencyException extends RuntimeException {
    public ConcurrencyException(String message) {
        super(message);
    }
}
