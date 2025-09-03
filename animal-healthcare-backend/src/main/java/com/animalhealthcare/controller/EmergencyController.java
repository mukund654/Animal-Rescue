package com.animalhealthcare.controller;

import com.animalhealthcare.dto.ApiResponse;
import com.animalhealthcare.dto.EmergencyRequestDto;
import com.animalhealthcare.entity.EmergencyRequest;
import com.animalhealthcare.entity.Status;
import com.animalhealthcare.entity.Urgency;
import com.animalhealthcare.security.UserPrincipal;
import com.animalhealthcare.service.EmergencyRequestService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/emergency")
public class EmergencyController {
    
    @Autowired
    private EmergencyRequestService emergencyRequestService;
    
    // Public endpoint for submitting emergency requests (no authentication required)
    @PostMapping("/submit")
    public ResponseEntity<?> submitEmergencyRequest(@Valid @RequestBody EmergencyRequestDto requestDto,
                                                   Authentication authentication) {
        try {
            Long userId = null;
            if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
                UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
                userId = userPrincipal.getId();
            }
            
            EmergencyRequest savedRequest = emergencyRequestService.createEmergencyRequest(requestDto, userId);
            return ResponseEntity.ok(ApiResponse.success("Emergency request submitted successfully", savedRequest));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error submitting emergency request: " + e.getMessage()));
        }
    }
    
    // Get all emergency requests (Admin/Volunteer only)
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VOLUNTEER')")
    public ResponseEntity<?> getAllRequests() {
        try {
            List<EmergencyRequest> requests = emergencyRequestService.findAllRequests();
            return ResponseEntity.ok(ApiResponse.success("Emergency requests retrieved", requests));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error retrieving requests: " + e.getMessage()));
        }
    }
    
    // Get pending requests ordered by priority (Admin/Volunteer only)
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VOLUNTEER')")
    public ResponseEntity<?> getPendingRequests() {
        try {
            List<EmergencyRequest> requests = emergencyRequestService.findPendingRequestsByPriority();
            return ResponseEntity.ok(ApiResponse.success("Pending requests retrieved", requests));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error retrieving pending requests: " + e.getMessage()));
        }
    }
    
    // Get emergency request by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VOLUNTEER')")
    public ResponseEntity<?> getRequestById(@PathVariable String id) {
        try {
            EmergencyRequest request = emergencyRequestService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Emergency request not found"));
            return ResponseEntity.ok(ApiResponse.success("Emergency request found", request));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error retrieving request: " + e.getMessage()));
        }
    }
    
    // Get user's own emergency requests
    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('USER') or hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<?> getMyRequests(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            List<EmergencyRequest> requests = emergencyRequestService.findRequestsByUserId(userPrincipal.getId());
            return ResponseEntity.ok(ApiResponse.success("Your requests retrieved", requests));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error retrieving your requests: " + e.getMessage()));
        }
    }
    
    // Assign volunteer to request (Admin/Volunteer only)
    @PutMapping("/{id}/assign/{volunteerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VOLUNTEER')")
    public ResponseEntity<?> assignVolunteer(@PathVariable String id, @PathVariable Long volunteerId) {
        try {
            EmergencyRequest updatedRequest = emergencyRequestService.assignVolunteer(id, volunteerId);
            return ResponseEntity.ok(ApiResponse.success("Volunteer assigned successfully", updatedRequest));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error assigning volunteer: " + e.getMessage()));
        }
    }
    
    // Update request status (Admin/Volunteer only)
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VOLUNTEER')")
    public ResponseEntity<?> updateRequestStatus(@PathVariable String id, @RequestParam String status) {
        try {
            Status requestStatus = Status.valueOf(status.toUpperCase());
            EmergencyRequest updatedRequest = emergencyRequestService.updateRequestStatus(id, requestStatus);
            return ResponseEntity.ok(ApiResponse.success("Request status updated", updatedRequest));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error updating request status: " + e.getMessage()));
        }
    }
    
    // Get requests by status (Admin/Volunteer only)
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VOLUNTEER')")
    public ResponseEntity<?> getRequestsByStatus(@PathVariable String status) {
        try {
            Status requestStatus = Status.valueOf(status.toUpperCase());
            List<EmergencyRequest> requests = emergencyRequestService.findRequestsByStatus(requestStatus);
            return ResponseEntity.ok(ApiResponse.success("Requests by status retrieved", requests));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error retrieving requests by status: " + e.getMessage()));
        }
    }
    
    // Get requests by urgency (Admin/Volunteer only)
    @GetMapping("/urgency/{urgency}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VOLUNTEER')")
    public ResponseEntity<?> getRequestsByUrgency(@PathVariable String urgency) {
        try {
            Urgency requestUrgency = Urgency.valueOf(urgency.toUpperCase());
            List<EmergencyRequest> requests = emergencyRequestService.findRequestsByUrgency(requestUrgency);
            return ResponseEntity.ok(ApiResponse.success("Requests by urgency retrieved", requests));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error retrieving requests by urgency: " + e.getMessage()));
        }
    }
    
    // Get recent requests (Admin/Volunteer only)
    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VOLUNTEER')")
    public ResponseEntity<?> getRecentRequests(@RequestParam(defaultValue = "24") int hours) {
        try {
            List<EmergencyRequest> requests = emergencyRequestService.findRecentRequests(hours);
            return ResponseEntity.ok(ApiResponse.success("Recent requests retrieved", requests));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error retrieving recent requests: " + e.getMessage()));
        }
    }
    
    // Get dashboard statistics (Admin only)
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDashboardStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("pendingRequests", emergencyRequestService.getPendingRequestsCount());
            stats.put("completedRequests", emergencyRequestService.getCompletedRequestsCount());
            stats.put("totalRequests", emergencyRequestService.findAllRequests().size());
            
            return ResponseEntity.ok(ApiResponse.success("Dashboard statistics retrieved", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error retrieving statistics: " + e.getMessage()));
        }
    }
    
    // Search requests by location (Admin/Volunteer only)
    @GetMapping("/search/location")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VOLUNTEER')")
    public ResponseEntity<?> searchByLocation(@RequestParam String location) {
        try {
            List<EmergencyRequest> requests = emergencyRequestService.findRequestsByLocation(location);
            return ResponseEntity.ok(ApiResponse.success("Requests by location retrieved", requests));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error searching by location: " + e.getMessage()));
        }
    }
    
    // Search requests by animal type (Admin/Volunteer only)
    @GetMapping("/search/animal")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VOLUNTEER')")
    public ResponseEntity<?> searchByAnimalType(@RequestParam String animalType) {
        try {
            List<EmergencyRequest> requests = emergencyRequestService.findRequestsByAnimalType(animalType);
            return ResponseEntity.ok(ApiResponse.success("Requests by animal type retrieved", requests));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error searching by animal type: " + e.getMessage()));
        }
    }
    
    // Mark emergency request as complete (Volunteer/Admin only)
    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<?> markRequestComplete(@PathVariable String id, 
                                                Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            EmergencyRequest updatedRequest = emergencyRequestService.markRequestComplete(id, userPrincipal.getId());
            return ResponseEntity.ok(ApiResponse.success("Emergency request marked as complete", updatedRequest));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error marking request as complete: " + e.getMessage()));
        }
    }
    
    // Get completion statistics (Admin only)
    @GetMapping("/completion-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getCompletionStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalRequests", emergencyRequestService.findAllRequests().size());
            stats.put("completedRequests", emergencyRequestService.getCompletedRequestsCount());
            stats.put("pendingRequests", emergencyRequestService.getPendingRequestsCount());
            stats.put("inProgressRequests", emergencyRequestService.findRequestsByStatus(Status.IN_PROGRESS).size());
            
            return ResponseEntity.ok(ApiResponse.success("Completion statistics retrieved", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error retrieving completion statistics: " + e.getMessage()));
        }
    }
}
