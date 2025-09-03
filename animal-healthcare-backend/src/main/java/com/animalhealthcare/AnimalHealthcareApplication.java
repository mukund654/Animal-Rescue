package com.animalhealthcare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.animalhealthcare")
@EnableJpaRepositories(basePackages = "com.animalhealthcare.repository")
public class AnimalHealthcareApplication {

    public static void main(String[] args) {
        SpringApplication.run(AnimalHealthcareApplication.class, args);
        System.out.println("🏥 Animal Rescue Backend Server Started Successfully!");
        System.out.println("🌍 Server running on: http://localhost:8080/api");
        System.out.println("📊 Database: MySQL (animalrescue)");
        System.out.println("🔒 Security: JWT Authentication Enabled");
        System.out.println("🚑 Emergency Endpoint: http://localhost:8080/api/emergency/submit");
        System.out.println("🔐 Auth Endpoints: http://localhost:8080/api/auth/signin | /signup");
    }
}
