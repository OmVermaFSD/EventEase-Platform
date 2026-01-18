# EventEase Backend

A production-ready Spring Boot application for high-concurrency ticket flash sales with optimistic locking and comprehensive DevOps infrastructure.

## Features

- **High-Concurrency Booking**: Optimistic locking with `@Version` field
- **Flash Sale Engine**: Scheduled seat resets every minute
- **Admin Dashboard**: Complete management endpoints
- **Production Ready**: Docker, PostgreSQL, Redis support
- **Real-time Seat Map**: Live seat status tracking

## Tech Stack

- **Java 17** with Spring Boot 3
- **Database**: H2 (dev) / PostgreSQL (production)
- **Caching**: Redis with Cache-Aside pattern
- **Build Tool**: Maven
- **Containerization**: Docker & Docker Compose

## Quick Start

### Development (H2 Database)

```bash
# Clone and run
mvn spring-boot:run
```

Access H2 Console: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:eventease`
- Username: `sa`
- Password: `password`

### Production (Docker Compose)

```bash
# Build and run all services
docker-compose up --build

# Run in background
docker-compose up -d --build
```

Services:
- **Backend**: http://localhost:8080
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## API Endpoints

### Booking API
- `GET /api/booking/seats` - Get complete seat map
- `POST /api/booking/book/{seatId}?userId={userId}` - Book a seat
- `GET /api/booking/user/{userId}` - Get user's bookings
- `GET /api/booking/available-count` - Get available seats count

### Admin API
- `POST /api/admin/reset` - Reset all seats to AVAILABLE
- `POST /api/admin/start` - Start flash sale
- `GET /api/admin/transactions` - Get transaction logs
- `GET /api/admin/status` - Get system status

## Architecture

### Concurrency Control
- **Optimistic Locking**: `@Version` field prevents race conditions
- **Custom Exceptions**: `ConcurrencyConflictException` for 409 responses
- **Transactional Management**: Proper isolation levels

### Flash Sale Engine
- **Scheduled Reset**: Runs every minute (`cron = "0 * * * * *"`)
- **Bulk Operations**: Efficient seat status updates
- **Comprehensive Logging**: Full audit trail

### Data Model
- **100 Seats**: 10 rows × 10 columns (A1-J10)
- **Status Enum**: AVAILABLE, LOCKED, SOLD
- **Audit Fields**: Created/Updated timestamps

## Configuration

### Development Profile
- H2 in-memory database
- SQL logging enabled
- Auto DDL: create-drop

### Production Profile
- PostgreSQL persistent database
- Redis caching
- Optimized logging

## Monitoring & Health Checks

- **Application Health**: `/actuator/health`
- **Database Health**: PostgreSQL health check
- **Redis Health**: Redis ping check
- **Container Health**: Custom endpoint checks

## Performance Considerations

- **Connection Pooling**: HikariCP default
- **Batch Operations**: Efficient bulk updates
- **Caching Strategy**: Redis for frequently accessed data
- **Indexing**: Optimized queries on status and userId

## Error Handling

- **409 Conflict**: Concurrency issues
- **400 Bad Request**: Invalid seat operations
- **404 Not Found**: Missing resources
- **500 Internal Server**: Unexpected errors

## Development

### Running Tests
```bash
mvn test
```

### Building JAR
```bash
mvn clean package
```

### Docker Build
```bash
docker build -t eventease-backend .
```

## Production Deployment

### Environment Variables
```bash
SPRING_PROFILES_ACTIVE=production
SPRING_DATASOURCE_URL=jdbc:postgresql://your-db:5432/eventease
SPRING_DATASOURCE_USERNAME=eventease
SPRING_DATASOURCE_PASSWORD=your-password
SPRING_REDIS_HOST=your-redis
```

### Scaling
- **Horizontal Scaling**: Multiple backend instances
- **Database Scaling**: Read replicas for queries
- **Redis Cluster**: Distributed caching

## Security Notes

- **Input Validation**: Spring Validation
- **SQL Injection**: JPA parameterized queries
- **CORS**: Configure as needed
- **Authentication**: Add Spring Security as required

## Monitoring & Observability

- **Application Logs**: Structured logging with SLF4J
- **Database Logs**: SQL query logging
- **Performance Metrics**: Add Micrometer as needed
- **Distributed Tracing**: Add OpenTelemetry as needed
