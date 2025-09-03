package com.animalhealthcare.repository;

import com.animalhealthcare.entity.EmergencyRequest;
import com.animalhealthcare.entity.Status;
import com.animalhealthcare.entity.Urgency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EmergencyRequestRepository extends JpaRepository<EmergencyRequest, String> {
    
    List<EmergencyRequest> findByStatus(Status status);
    
    List<EmergencyRequest> findByUrgency(Urgency urgency);
    
    List<EmergencyRequest> findByUserId(Long userId);
    
    List<EmergencyRequest> findByVolunteerId(Long volunteerId);
    
    @Query("SELECT er FROM EmergencyRequest er WHERE er.status = :status ORDER BY er.urgency ASC, er.createdAt ASC")
    List<EmergencyRequest> findPendingRequestsByPriority(@Param("status") Status status);
    
    @Query("SELECT er FROM EmergencyRequest er WHERE er.createdAt >= :fromDate ORDER BY er.createdAt DESC")
    List<EmergencyRequest> findRecentRequests(@Param("fromDate") LocalDateTime fromDate);
    
    @Query("SELECT er FROM EmergencyRequest er WHERE er.location LIKE %:location%")
    List<EmergencyRequest> findByLocationContaining(@Param("location") String location);
    
    @Query("SELECT er FROM EmergencyRequest er WHERE er.animalType LIKE %:animalType%")
    List<EmergencyRequest> findByAnimalTypeContaining(@Param("animalType") String animalType);
    
    @Query("SELECT COUNT(er) FROM EmergencyRequest er WHERE er.status = :status")
    Long countByStatus(@Param("status") Status status);
}
