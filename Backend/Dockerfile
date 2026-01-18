# Multi-stage Dockerfile for compact enterprise backend
FROM openjdk:17-jdk-alpine AS builder
WORKDIR /app

# Copy Maven files
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build application
RUN ./mvnw clean package -DskipTests

# Production stage
FROM openjdk:17-jre-alpine
WORKDIR /app

# Add non-root user for security
RUN addgroup -g 1001 eventease && adduser -u 1001 -G eventease -s /bin/sh -D eventease

# Copy JAR from builder
COPY --from=builder /app/target/event-ease-backend-*.jar app.jar

# Change ownership
RUN chown -R eventease:eventease /app

# Switch to non-root user
USER eventease

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/status || exit 1

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]
