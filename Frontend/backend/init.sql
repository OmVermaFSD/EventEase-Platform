-- EventEase Database Initialization Script
-- PostgreSQL 15 compatible

-- Create database if it doesn't exist
-- CREATE DATABASE IF NOT EXISTS eventease;
-- \c eventease;

-- Drop existing tables (for clean rebuild)
DROP TABLE IF EXISTS booking_transactions CASCADE;
DROP TABLE IF EXISTS seat_locks CASCADE;
DROP TABLE IF EXISTS seats CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    user_type VARCHAR(20) DEFAULT 'CUSTOMER' -- CUSTOMER, ADMIN, STAFF
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_active ON users(is_active);

-- Events Table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    venue VARCHAR(200),
    total_seats INTEGER NOT NULL DEFAULT 100,
    available_seats INTEGER NOT NULL DEFAULT 100,
    price_per_seat DECIMAL(10,2) NOT NULL DEFAULT 99.99,
    status VARCHAR(20) DEFAULT 'UPCOMING', -- UPCOMING, LIVE, COMPLETED, CANCELLED
    flash_sale_start TIMESTAMP WITH TIME ZONE,
    flash_sale_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for events
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_flash_sale ON events(flash_sale_start, flash_sale_end);

-- Seats Table
CREATE TABLE seats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    seat_number VARCHAR(10) NOT NULL, -- e.g., "A1", "B2", etc.
    row_number INTEGER NOT NULL,
    seat_number_in_row INTEGER NOT NULL,
    section VARCHAR(50),
    status VARCHAR(20) DEFAULT 'AVAILABLE', -- AVAILABLE, LOCKED, SOLD, RESERVED
    price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, seat_number)
);

-- Indexes for seats
CREATE INDEX idx_seats_event_id ON seats(event_id);
CREATE INDEX idx_seats_status ON seats(status);
CREATE INDEX idx_seats_event_status ON seats(event_id, status);
CREATE INDEX idx_seats_row_col ON seats(row_number, seat_number_in_row);

-- Seat Locks Table (for optimistic locking during flash sales)
CREATE TABLE seat_locks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seat_id UUID NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lock_token VARCHAR(255) NOT NULL,
    locked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, RELEASED, CONVERTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for seat locks
CREATE INDEX idx_seat_locks_seat_id ON seat_locks(seat_id);
CREATE INDEX idx_seat_locks_user_id ON seat_locks(user_id);
CREATE INDEX idx_seat_locks_token ON seat_locks(lock_token);
CREATE INDEX idx_seat_locks_expires ON seat_locks(expires_at);
CREATE INDEX idx_seat_locks_status ON seat_locks(status);

-- Booking Transactions Table
CREATE TABLE booking_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id VARCHAR(50) UNIQUE NOT NULL, -- External transaction ID
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    seat_id UUID NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL, -- SUCCESS, FAILED, LOCKED, TIMEOUT
    amount DECIMAL(10,2),
    payment_method VARCHAR(50), -- CREDIT_CARD, UPI, etc.
    payment_status VARCHAR(20), -- PENDING, COMPLETED, FAILED, REFUNDED
    latency_ms INTEGER, -- Response time in milliseconds
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for booking transactions
CREATE INDEX idx_booking_transactions_user_id ON booking_transactions(user_id);
CREATE INDEX idx_booking_transactions_event_id ON booking_transactions(event_id);
CREATE INDEX idx_booking_transactions_seat_id ON booking_transactions(seat_id);
CREATE INDEX idx_booking_transactions_type ON booking_transactions(transaction_type);
CREATE INDEX idx_booking_transactions_created ON booking_transactions(created_at);
CREATE INDEX idx_booking_transactions_tx_id ON booking_transactions(transaction_id);

-- Insert sample event
INSERT INTO events (name, description, event_date, venue, total_seats, available_seats, price_per_seat, status, flash_sale_start, flash_sale_end) VALUES
(
    'EventEase Concert 2024',
    'Annual EventEase Technology Conference & Concert',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'Tech Convention Center',
    100,
    100,
    99.99,
    'UPCOMING',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    CURRENT_TIMESTAMP + INTERVAL '31 days'
);

-- Generate seats for the event (10x10 grid)
INSERT INTO seats (event_id, seat_number, row_number, seat_number_in_row, section, status, price)
SELECT 
    id,
    CHR(65 + (row_num - 1)) || row_num::text as seat_number, -- A1, A2, ..., J10
    row_num,
    col_num,
    'ORCHESTRA' as section,
    'AVAILABLE' as status,
    99.99 as price
FROM (
    SELECT 
        id,
        generate_series(1, 10) as row_num,
        generate_series(1, 10) as col_num
    FROM events 
    WHERE name = 'EventEase Concert 2024'
) seat_data;

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seats_updated_at BEFORE UPDATE ON seats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create stored procedure for flash sale seat availability
CREATE OR REPLACE FUNCTION get_seat_availability(p_event_id UUID)
RETURNS TABLE(
    total_seats BIGINT,
    available_seats BIGINT,
    locked_seats BIGINT,
    sold_seats BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_seats,
        COUNT(*) FILTER (WHERE s.status = 'AVAILABLE') as available_seats,
        COUNT(*) FILTER (WHERE s.status = 'LOCKED') as locked_seats,
        COUNT(*) FILTER (WHERE s.status = 'SOLD') as sold_seats
    FROM seats s
    WHERE s.event_id = p_event_id;
END;
$$ LANGUAGE plpgsql;

-- Create function for optimistic seat locking
CREATE OR REPLACE FUNCTION lock_seat(
    p_seat_id UUID,
    p_user_id UUID,
    p_lock_token VARCHAR(255),
    p_lock_duration_minutes INTEGER DEFAULT 5
)
RETURNS BOOLEAN AS $$
DECLARE
    seat_status VARCHAR(20);
    lock_count INTEGER;
BEGIN
    -- Check if seat is available
    SELECT status INTO seat_status 
    FROM seats 
    WHERE id = p_seat_id;
    
    IF seat_status != 'AVAILABLE' THEN
        RETURN FALSE;
    END IF;
    
    -- Check for existing active locks
    SELECT COUNT(*) INTO lock_count
    FROM seat_locks 
    WHERE seat_id = p_seat_id 
    AND status = 'ACTIVE' 
    AND expires_at > CURRENT_TIMESTAMP;
    
    IF lock_count > 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Create lock
    INSERT INTO seat_locks (seat_id, user_id, lock_token, expires_at)
    VALUES (p_seat_id, p_user_id, p_lock_token, CURRENT_TIMESTAMP + INTERVAL '1 minute' * p_lock_duration_minutes);
    
    -- Update seat status
    UPDATE seats 
    SET status = 'LOCKED' 
    WHERE id = p_seat_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function for converting lock to sale
CREATE OR REPLACE FUNCTION convert_lock_to_sale(
    p_lock_token VARCHAR(255),
    p_transaction_id VARCHAR(50),
    p_payment_method VARCHAR(50),
    p_amount DECIMAL(10,2)
)
RETURNS BOOLEAN AS $$
DECLARE
    lock_record RECORD;
BEGIN
    -- Find active lock
    SELECT sl.*, s.event_id INTO lock_record
    FROM seat_locks sl
    JOIN seats s ON sl.seat_id = s.id
    WHERE sl.lock_token = p_lock_token 
    AND sl.status = 'ACTIVE' 
    AND sl.expires_at > CURRENT_TIMESTAMP;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update lock status
    UPDATE seat_locks 
    SET status = 'CONVERTED' 
    WHERE id = lock_record.id;
    
    -- Update seat status
    UPDATE seats 
    SET status = 'SOLD' 
    WHERE id = lock_record.seat_id;
    
    -- Create booking transaction
    INSERT INTO booking_transactions (
        transaction_id, user_id, event_id, seat_id, 
        transaction_type, amount, payment_method, payment_status
    ) VALUES (
        p_transaction_id, lock_record.user_id, lock_record.event_id, lock_record.seat_id,
        'SUCCESS', p_amount, p_payment_method, 'COMPLETED'
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO eventease;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO eventease;

-- Create read-only user for monitoring
-- CREATE USER eventease_readonly WITH PASSWORD 'readonly_password';
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO eventease_readonly;

COMMIT;
