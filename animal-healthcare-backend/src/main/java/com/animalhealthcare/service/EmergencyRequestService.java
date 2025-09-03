package com.animalhealthcare.service;

import com.animalhealthcare.dto.EmergencyRequestDto;
import com.animalhealthcare.entity.EmergencyRequest;
import com.animalhealthcare.entity.Status;
import com.animalhealthcare.entity.Urgency;
import com.animalhealthcare.entity.User;
import com.animalhealthcare.repository.EmergencyRequestRepository;
import com.animalhealthcare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class EmergencyRequestService {
    
    @Autowired
    private EmergencyRequestRepository emergencyRequestRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public EmergencyRequest createEmergencyRequest(EmergencyRequestDto requestDto, Long userId) {
        EmergencyRequest emergencyRequest = new EmergencyRequest();
        
        // Generate unique ID
        emergencyRequest.setId("EMR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        
        // Set user ID if provided (null for anonymous requests)
        emergencyRequest.setUserId(userId);
        
        // Map DTO fields
        emergencyRequest.setAnimalType(requestDto.getAnimalType());
        emergencyRequest.setLocation(requestDto.getLocation());
        emergencyRequest.setContactName(requestDto.getContactName());
        emergencyRequest.setContactPhone(requestDto.getContactPhone());
        emergencyRequest.setContactEmail(requestDto.getContactEmail());
        emergencyRequest.setDescription(requestDto.getDescription());
        
        // Set urgency
        try {
            emergencyRequest.setUrgency(Urgency.valueOf(requestDto.getUrgency().toUpperCase()));
        } catch (IllegalArgumentException e) {
            emergencyRequest.setUrgency(Urgency.MEDIUM); // Default urgency
        }
        
        // Set default status
        emergencyRequest.setStatus(Status.PENDING);
        
        return emergencyRequestRepository.save(emergencyRequest);
    }
    
    public Optional<EmergencyRequest> findById(String id) {
        return emergencyRequestRepository.findById(id);
    }
    
    public List<EmergencyRequest> findAllRequests() {
        return emergencyRequestRepository.findAll();
    }
    
    public List<EmergencyRequest> findRequestsByStatus(Status status) {
        return emergencyRequestRepository.findByStatus(status);
    }
    
    public List<EmergencyRequest> findRequestsByUrgency(Urgency urgency) {
        return emergencyRequestRepository.findByUrgency(urgency);
    }
    
    public List<EmergencyRequest> findRequestsByUserId(Long userId) {
        return emergencyRequestRepository.findByUserId(userId);
    }
    
    public List<EmergencyRequest> findRequestsByVolunteerId(Long volunteerId) {
        return emergencyRequestRepository.findByVolunteerId(volunteerId);
    }
    
    public List<EmergencyRequest> findPendingRequestsByPriority() {
        return emergencyRequestRepository.findPendingRequestsByPriority(Status.PENDING);
    }
    
    public List<EmergencyRequest> findRecentRequests(int hours) {
        LocalDateTime fromDate = LocalDateTime.now().minusHours(hours);
        return emergencyRequestRepository.findRecentRequests(fromDate);
    }
    
    public List<EmergencyRequest> findRequestsByLocation(String location) {
        return emergencyRequestRepository.findByLocationContaining(location);
    }
    
    public List<EmergencyRequest> findRequestsByAnimalType(String animalType) {
        return emergencyRequestRepository.findByAnimalTypeContaining(animalType);
    }
    
    public EmergencyRequest assignVolunteer(String requestId, Long volunteerId) {
        EmergencyRequest request = emergencyRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Emergency request not found"));
        
        Optional<User> volunteer = userRepository.findById(volunteerId);
        if (volunteer.isPresent()) {
            User vol = volunteer.get();
            request.setVolunteerId(volunteerId);
            request.setVolunteerName(vol.getFullName());
            request.setVolunteerPhone(vol.getPhone());
            request.setStatus(Status.ACCEPTED);
            
            return emergencyRequestRepository.save(request);
        } else {
            throw new RuntimeException("Volunteer not found");
        }
    }
    
    public EmergencyRequest updateRequestStatus(String requestId, Status status) {
        EmergencyRequest request = emergencyRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Emergency request not found"));
        
        request.setStatus(status);
        return emergencyRequestRepository.save(request);
    }
    
    public EmergencyRequest updateRequest(EmergencyRequest request) {
        return emergencyRequestRepository.save(request);
    }
    
    public void deleteRequest(String id) {
        emergencyRequestRepository.deleteById(id);
    }
    
    public Long countRequestsByStatus(Status status) {
        return emergencyRequestRepository.countByStatus(status);
    }
    
    public Long getPendingRequestsCount() {
        return countRequestsByStatus(Status.PENDING);
    }
    
    public Long getCompletedRequestsCount() {
        return countRequestsByStatus(Status.COMPLETED);
    }
    
    public EmergencyRequest markRequestComplete(String requestId, Long completedByUserId) {
        EmergencyRequest request = emergencyRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Emergency request not found"));
        
        // Verify that only assigned volunteer or admin can mark as complete
        Optional<User> completingUser = userRepository.findById(completedByUserId);
        if (completingUser.isPresent()) {
            User user = completingUser.get();
            
            // Check if user is admin or the assigned volunteer
            boolean canComplete = user.getRole().name().equals("ADMIN") || 
                                (request.getVolunteerId() != null && 
                                 request.getVolunteerId().equals(completedByUserId));
            
            if (!canComplete) {
                throw new RuntimeException("Only the assigned volunteer or admin can mark this request as complete");
            }
            
            request.setStatus(Status.COMPLETED);
            request.setCompletedAt(LocalDateTime.now());
            request.setCompletedBy(user.getFullName());
            
            return emergencyRequestRepository.save(request);
        } else {
            throw new RuntimeException("User not found");
        }
    }
}
