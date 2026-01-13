# EventEase Backend

## Environment Setup

### Required Environment Variables

Database credentials are managed through environment variables for security. **Both `DB_USERNAME` and `DB_PASSWORD` are required** - the application will fail to start if either is missing.

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your actual database credentials and configuration:
   ```bash
   # Required database credentials
   DB_USERNAME=your_actual_username
   DB_PASSWORD=your_actual_password

   # Hibernate configuration (environment-specific)
   JPA_DDL_AUTO=validate    # Use 'update' only in development
   JPA_SHOW_SQL=false       # Set to 'true' for debugging
   ```

### Environment-Specific Configuration

#### Development Environment
```bash
JPA_DDL_AUTO=update        # Safe for development - updates schema automatically
JPA_SHOW_SQL=true          # Show SQL queries for debugging
```

#### Production Environment
```bash
JPA_DDL_AUTO=validate      # Safe - validates schema without changes
JPA_SHOW_SQL=false         # Don't log SQL queries in production
```

### Important Security Notes

- Never commit the `.env` file to version control
- The `.env` file is automatically excluded via `.gitignore`
- Use strong, unique passwords for database access
- **Never use `JPA_DDL_AUTO=update` in production** - it can corrupt your database
- Consider using different credentials for development, staging, and production environments

## Running the Application

```bash
./mvnw spring-boot:run
```

The application will validate all required environment variables at startup and fail fast if any are missing. It will start on port 8080 and connect to the PostgreSQL database using the credentials from your `.env` file.
