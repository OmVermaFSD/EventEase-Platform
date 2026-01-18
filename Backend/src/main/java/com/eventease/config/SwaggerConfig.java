package com.eventease.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI eventEaseOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("EventEase Backend API")
                        .description("High-Concurrency Ticket Flash Sale Backend System with Enterprise Features")
                        .version("2.0.0")
                        .contact(new Contact()
                                .name("EventEase Team")
                                .email("support@eventease.com")
                                .url("https://eventease.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Development Server"),
                        new Server()
                                .url("https://api.eventease.com")
                                .description("Production Server")
                ))
                .tags(List.of(
                        new Tag()
                                .name("Booking API")
                                .description("Seat booking and management operations"),
                        new Tag()
                                .name("Admin API")
                                .description("Administrative operations for flash sale management")
                ));
    }
}
