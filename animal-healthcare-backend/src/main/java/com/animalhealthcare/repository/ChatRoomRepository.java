package com.animalhealthcare.repository;

import com.animalhealthcare.entity.ChatRoom;
import com.animalhealthcare.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    
    // Find chat room by emergency request ID
    Optional<ChatRoom> findByEmergencyRequestId(String emergencyRequestId);
    
    // Find all chat rooms for a user
    List<ChatRoom> findByUserOrderByUpdatedAtDesc(User user);
    
    // Find all chat rooms for a volunteer
    List<ChatRoom> findByVolunteerOrderByUpdatedAtDesc(User volunteer);
    
    // Find chat rooms where user is either the requester or volunteer
    @Query("SELECT c FROM ChatRoom c WHERE c.user = :user OR c.volunteer = :user ORDER BY c.updatedAt DESC")
    List<ChatRoom> findByUserOrVolunteer(@Param("user") User user);
    
    // Find active chat rooms
    @Query("SELECT c FROM ChatRoom c WHERE c.status = 'ACTIVE' ORDER BY c.updatedAt DESC")
    List<ChatRoom> findActiveChatRooms();
    
    // Find chat rooms by status
    List<ChatRoom> findByStatusOrderByUpdatedAtDesc(com.animalhealthcare.entity.ChatStatus status);
    
    // Check if chat room exists for emergency request
    boolean existsByEmergencyRequestId(String emergencyRequestId);
}
