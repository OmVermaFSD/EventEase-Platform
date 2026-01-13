package com.eventease.backend.config;

import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class DotenvConfig implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    private static final String[] REQUIRED_ENV_VARS = {"DB_USERNAME", "DB_PASSWORD"};

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        System.out.println("DotenvConfig: Starting environment variable initialization...");
        System.out.println("DotenvConfig: Current working directory: " + System.getProperty("user.dir"));

        try {
            // Load .env file manually to avoid parsing issues
            Path envFile = Paths.get(".env");
            System.out.println("DotenvConfig: Looking for .env file at: " + envFile.toAbsolutePath());
            System.out.println("DotenvConfig: .env file exists: " + Files.exists(envFile));

            if (Files.exists(envFile)) {
                System.out.println("DotenvConfig: Reading .env file...");
                java.util.List<String> lines = Files.readAllLines(envFile);
                int lineCount = 0;
                for (String line : lines) {
                    lineCount++;
                    // Print raw bytes to debug
                    System.out.println("DotenvConfig: Raw line " + lineCount + " bytes: " +
                        java.util.Arrays.toString(line.getBytes()));

                    line = line.trim();
                    System.out.println("DotenvConfig: Processed line " + lineCount + ": '" + line + "'");

                    if (line.isEmpty() || line.startsWith("#")) {
                        continue; // Skip empty lines and comments
                    }

                    int equalsIndex = line.indexOf('=');
                    if (equalsIndex > 0) {
                        String key = line.substring(0, equalsIndex).trim();
                        String value = line.substring(equalsIndex + 1).trim();

                        // Remove quotes if present
                        if (value.startsWith("\"") && value.endsWith("\"")) {
                            value = value.substring(1, value.length() - 1);
                        }

                        System.out.println("DotenvConfig: Parsed key='" + key + "', value='" + value + "'");
                        // Set as system property if not already set
                        if (System.getProperty(key) == null) {
                            System.setProperty(key, value);
                            System.out.println("DotenvConfig: Successfully set system property: " + key + "=" + System.getProperty(key));
                        } else {
                            System.out.println("DotenvConfig: System property already set: " + key);
                        }
                    }
                }
                System.out.println("DotenvConfig: Finished reading .env file, processed " + lineCount + " lines");
            } else {
                System.out.println("DotenvConfig: .env file not found");
            }

            // Validate required environment variables
            for (String requiredVar : REQUIRED_ENV_VARS) {
                String value = System.getProperty(requiredVar);
                System.out.println("DotenvConfig: Checking required var " + requiredVar + " - System property: '" + value + "'");

                if (value == null || value.trim().isEmpty()) {
                    value = System.getenv(requiredVar);
                    System.out.println("DotenvConfig: Checking required var " + requiredVar + " - Environment var: '" + value + "'");

                    if (value == null || value.trim().isEmpty()) {
                        throw new RuntimeException(
                            String.format("Required environment variable '%s' is not set. " +
                                        "Please set it in your .env file or as a system environment variable.", requiredVar)
                        );
                    }
                }
            }
            System.out.println("DotenvConfig: Environment variable initialization completed successfully");

        } catch (IOException e) {
            System.err.println("Warning: Could not read .env file: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("DotenvConfig: Failed with exception: " + e.getMessage());
            throw new RuntimeException("Failed to load environment configuration: " + e.getMessage(), e);
        }
    }
}
