# EventEase Backend Dockerfile
FROM openjdk:17-alpine

# Install necessary packages
RUN apk add --no-cache curl

# Create app directory
WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Expose port 8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "target/eventease-backend-*.jar", \
           "--spring.profiles.active=prod", \
           "--spring.datasource.url=jdbc:postgresql://postgres-db:5432/eventease", \
           "--spring.datasource.username=eventease", \
           "--spring.datasource.password=eventease123", \
           "--spring.redis.host=redis-cache", \
           "--spring.redis.port=6379"]
