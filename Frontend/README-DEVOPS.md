# EventEase - Enterprise Infrastructure & DevOps

This document outlines the comprehensive DevOps and infrastructure setup for the EventEase Flash Sale Terminal.

## 🐳 Containerization (Docker)

### Frontend Dockerfile
- **Multi-stage build**: Node.js build stage → Nginx serving stage
- **Optimized for production**: Minimal image size with Alpine Linux
- **Security headers**: CORS, XSS protection, content security policy
- **Rate limiting**: Built-in protection for API endpoints

### Backend Dockerfile
- **OpenJDK 17 Alpine**: Lightweight and secure Java runtime
- **Health checks**: Built-in container health monitoring
- **Environment configuration**: Production-ready with external service connections
- **Maven optimization**: Offline dependency resolution for faster builds

### Key Features
```bash
# Build frontend
docker build -t eventease-frontend .

# Build backend
docker build -t eventease-backend ./backend

# Run with docker-compose
docker-compose up -d
```

## 🚀 Docker Compose Services

### Service Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend     │    │    Backend      │    │   PostgreSQL   │
│   (Nginx)      │◄──►│  (Spring Boot)  │◄──►│    Database     │
│   Port: 80     │    │   Port: 8080   │    │   Port: 5432   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │     Redis       │
                       │     Cache       │
                       │   Port: 6379   │
                       └─────────────────┘
```

### Services Configuration
- **eventease-frontend**: React app served by Nginx (Port 3000)
- **eventease-backend**: Spring Boot API (Port 8080)
- **postgres-db**: PostgreSQL 15 database (Port 5432)
- **redis-cache**: Redis 7 caching layer (Port 6379)
- **nginx-lb**: Load balancer for production (Ports 80/443)

### Network & Volumes
- **eventease-network**: Isolated Docker network for service communication
- **Persistent storage**: Database and Redis data persisted across restarts
- **Health checks**: All services include health monitoring

## ⚡ Caching Strategy (Redis)

### Cache-Aside Pattern Implementation

The Redis configuration implements a sophisticated caching strategy optimized for flash sale scenarios:

#### Cache Key Strategy
```
seat:availability:123     → Available seats count for event
seat:status:456           → Individual seat status
user:session:user789       → User session data
flashsale:config:123       → Flash sale configuration
rate:limit:user789:api    → API rate limiting
```

#### TTL Configuration
- **Seat availability**: 5 minutes (high freshness required)
- **Seat status**: 2 minutes (real-time updates)
- **User sessions**: 30 minutes (user experience)
- **Rate limiting**: 1 minute (security)
- **Flash sale config**: 1 hour (stable configuration)

#### Performance Benefits
- **Sub-millisecond response times** for cached data
- **Reduced database load** during peak traffic
- **Scalable architecture** for thousands of concurrent users
- **Automatic cache refresh** prevents stale data

## 🔄 CI/CD Pipeline

### Pipeline Stages

#### 1. Backend CI Pipeline
- **Java 17 setup** with Maven caching
- **Unit & Integration tests** with PostgreSQL and Redis
- **Docker image building** with security scanning
- **Trivy vulnerability analysis** for container security

#### 2. Frontend CI Pipeline
- **Node.js 18 setup** with npm caching
- **ESLint & unit tests** with coverage reporting
- **Build optimization** for production
- **Container security scanning**

#### 3. Security & Quality Gates
- **SonarCloud analysis** for code quality
- **OWASP dependency checking** for vulnerability detection
- **Security scanning** with detailed reporting

#### 4. Deployment Pipeline
- **Staging deployment** for develop branch
- **Production deployment** for main branch
- **Health checks** and smoke testing
- **Slack notifications** for deployment status

### GitHub Actions Workflow
```yaml
# Triggers
- Push to main/develop branches
- Pull requests to main

# Jobs
1. backend-ci (Tests + Build + Security Scan)
2. frontend-ci (Tests + Build + Security Scan)
3. security-scan (SonarCloud + OWASP)
4. deploy-staging (develop branch only)
5. deploy-production (main branch only)
```

## 📊 Monitoring & Observability

### Health Check Endpoints
- **Frontend**: `GET /health` → Returns "healthy"
- **Backend**: `GET /actuator/health` → Spring Boot health status
- **Database**: PostgreSQL health check via connection testing
- **Redis**: Redis ping command for availability

### Logging Strategy
- **Nginx access logs**: Request tracking and performance monitoring
- **Application logs**: Structured logging with correlation IDs
- **Database logs**: Query performance and connection monitoring
- **Redis logs**: Cache hit rates and memory usage

### Metrics Collection
- **Response times**: Track API performance
- **Error rates**: Monitor system reliability
- **Cache hit ratios**: Redis effectiveness
- **Database connections**: Connection pool utilization

## 🔒 Security Configuration

### Container Security
- **Non-root user**: All containers run as non-privileged users
- **Minimal base images**: Alpine Linux for reduced attack surface
- **Security scanning**: Trivy integration in CI/CD
- **Vulnerability management**: Automated dependency updates

### Network Security
- **Isolated networks**: Docker network segmentation
- **Rate limiting**: Nginx configuration for API protection
- **CORS configuration**: Proper cross-origin resource sharing
- **Security headers**: XSS, CSRF, and content protection

### Database Security
- **Connection encryption**: SSL/TLS for database connections
- **Access controls**: Role-based database permissions
- **Audit logging**: Database operation tracking
- **Backup strategy**: Automated database backups

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Java 17+ (for local development)
- PostgreSQL 15+ (optional, uses Docker)
- Redis 7+ (optional, uses Docker)

### Development Setup
```bash
# Clone the repository
git clone <repository-url>
cd EventEase-frontend

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment
```bash
# Build and deploy to production
docker-compose -f docker-compose.yml --profile production up -d

# Scale services
docker-compose up -d --scale eventease-backend=3

# Update services
docker-compose pull && docker-compose up -d
```

## 🔧 Configuration

### Environment Variables
```bash
# Database Configuration
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres-db:5432/eventease
SPRING_DATASOURCE_USERNAME=eventease
SPRING_DATASOURCE_PASSWORD=eventease123

# Redis Configuration
SPRING_REDIS_HOST=redis-cache
SPRING_REDIS_PORT=6379
SPRING_CACHE_TYPE=redis

# Application Configuration
SPRING_PROFILES_ACTIVE=docker
SERVER_PORT=8080
```

### Custom Configuration
- **nginx.conf**: Web server configuration
- **redis.conf**: Redis optimization for flash sales
- **init.sql**: Database schema and sample data
- **Dockerfiles**: Container build configurations

## 📈 Performance Optimization

### Frontend Optimization
- **Code splitting**: Lazy loading for better performance
- **Asset compression**: Gzip compression in Nginx
- **Browser caching**: Static asset caching headers
- **CDN ready**: Configuration for CDN deployment

### Backend Optimization
- **Connection pooling**: Optimized database connections
- **Caching layer**: Redis for frequently accessed data
- **Async processing**: Non-blocking I/O operations
- **Memory management**: JVM tuning for container environment

### Database Optimization
- **Indexing strategy**: Optimized for flash sale queries
- **Connection pooling**: Efficient database connections
- **Query optimization**: Stored procedures for complex operations
- **Partitioning**: Ready for large-scale data

## 🛠️ Troubleshooting

### Common Issues
1. **Port conflicts**: Check if ports 3000, 8080, 5432, 6379 are available
2. **Memory issues**: Increase Docker memory allocation
3. **Connection failures**: Verify network connectivity between containers
4. **Cache issues**: Clear Redis cache if data is stale

### Debug Commands
```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs <service-name>

# Access container shell
docker-compose exec <service-name> sh

# Check resource usage
docker stats

# Clear Redis cache
docker-compose exec redis-cache redis-cli FLUSHALL
```

This enterprise-grade infrastructure setup ensures high availability, scalability, and security for the EventEase Flash Sale Terminal, capable of handling thousands of concurrent users during peak flash sale events.
