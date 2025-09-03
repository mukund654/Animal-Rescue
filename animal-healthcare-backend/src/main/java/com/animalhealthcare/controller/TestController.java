package com.animalhealthcare.controller;

import com.animalhealthcare.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/test")
public class TestController {
    
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        Map<String, Object> healthInfo = new HashMap<>();
        healthInfo.put("status", "UP");
        healthInfo.put("timestamp", LocalDateTime.now());
        healthInfo.put("application", "Animal Rescue Backend");
        healthInfo.put("version", "1.0.0");
        
        return ResponseEntity.ok(ApiResponse.success("Health check passed", healthInfo));
    }
    
    @GetMapping("/welcome")
    public ResponseEntity<?> welcome() {
        return ResponseEntity.ok(ApiResponse.success("Welcome to Animal Rescue API! 🏥🐾"));
    }
}
