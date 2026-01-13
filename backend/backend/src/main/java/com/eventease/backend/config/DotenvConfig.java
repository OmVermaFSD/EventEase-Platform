package com.eventease.backend.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

public class DotenvConfig implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    private static final String[] REQUIRED_ENV_VARS = {"DB_USERNAME", "DB_PASSWORD"};

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
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

            // Add .env variables to Spring Environment before property resolution
            ConfigurableEnvironment environment = applicationContext.getEnvironment();
            Map<String, Object> envVars = new HashMap<>();
            dotenv.entries().forEach(entry -> envVars.put(entry.getKey(), entry.getValue()));

            environment.getPropertySources().addFirst(
                new MapPropertySource("dotenv", envVars)
            );

        } catch (Exception e) {
            throw new RuntimeException("Failed to load environment configuration: " + e.getMessage(), e);
        }
    }
}
