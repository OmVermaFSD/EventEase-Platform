package com.eventease.backend.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class DotenvConfig {

    private static final String[] REQUIRED_ENV_VARS = {"DB_USERNAME", "DB_PASSWORD"};

    static {
        // Load environment variables at class loading time, before Spring context initialization
        try {
            Dotenv dotenv = Dotenv.configure()
                    .ignoreIfMissing()
                    .load();

            // Validate required environment variables
            for (String requiredVar : REQUIRED_ENV_VARS) {
                String value = System.getenv(requiredVar);
                if (value == null || value.trim().isEmpty()) {
                    value = dotenv.get(requiredVar);
                    if (value == null || value.trim().isEmpty()) {
                        throw new RuntimeException(
                            String.format("Required environment variable '%s' is not set. " +
                                        "Please set it in your .env file or as a system environment variable.", requiredVar)
                        );
                    }
                }
            }

            // Set system properties for Spring to pick up
            dotenv.entries().forEach(entry -> {
                if (System.getProperty(entry.getKey()) == null) {
                    System.setProperty(entry.getKey(), entry.getValue());
                }
            });

        } catch (Exception e) {
            throw new RuntimeException("Failed to load environment configuration: " + e.getMessage(), e);
        }
    }

    @Bean
    public Dotenv dotenv() {
        return Dotenv.configure()
                .ignoreIfMissing()
                .load();
    }
}
