package com.animalhealthcare.controller;

import com.animalhealthcare.dto.ApiResponse;
import com.animalhealthcare.entity.ChatMessage;
import com.animalhealthcare.entity.ChatRoom;
import com.animalhealthcare.security.UserPrincipal;
import com.animalhealthcare.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "*")
public class ChatController {
    
    @Autowired
    private ChatService chatService;
    
    // Create or get chat room for emergency request
    @PostMapping("/room/emergency/{emergencyId}")
    @PreAuthorize("hasRole('USER') or hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<?> createChatRoom(@PathVariable String emergencyId, 
                                          Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            ChatRoom chatRoom = chatService.createOrGetChatRoom(emergencyId, userPrincipal.getId());
            
            return ResponseEntity.ok(ApiResponse.success("Chat room created/retrieved", chatRoom));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error creating chat room: " + e.getMessage()));
        }
    }
    
    // Get chat room by emergency ID
    @GetMapping("/room/emergency/{emergencyId}")
    @PreAuthorize("hasRole('USER') or hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<?> getChatRoomByEmergencyId(@PathVariable String emergencyId) {
        try {
            return chatService.getChatRoomByEmergencyId(emergencyId)
                    .map(chatRoom -> ResponseEntity.ok(ApiResponse.success("Chat room found", chatRoom)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error retrieving chat room: " + e.getMessage()));
        }
    }
    
    // Assign volunteer to chat room
    @PutMapping("/room/{roomId}/assign/{volunteerId}")
    @PreAuthorize("hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<?> assignVolunteer(@PathVariable Long roomId, 
                                           @PathVariable Long volunteerId) {
        try {
            ChatRoom chatRoom = chatService.assignVolunteer(roomId, volunteerId);
            return ResponseEntity.ok(ApiResponse.success("Volunteer assigned to chat", chatRoom));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error assigning volunteer: " + e.getMessage()));
        }
    }
    
    // Send message
    @PostMapping("/room/{roomId}/message")
    @PreAuthorize("hasRole('USER') or hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<?> sendMessage(@PathVariable Long roomId,
                                       @RequestBody Map<String, String> messageData,
                                       Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            String message = messageData.get("message");
            
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Message cannot be empty"));
            }
            
            ChatMessage chatMessage = chatService.sendMessage(roomId, userPrincipal.getId(), message.trim());
            return ResponseEntity.ok(ApiResponse.success("Message sent", chatMessage));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error sending message: " + e.getMessage()));
        }
    }
    
    // Get messages for a chat room
    @GetMapping("/room/{roomId}/messages")
    @PreAuthorize("hasRole('USER') or hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<?> getChatMessages(@PathVariable Long roomId,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "50") int size) {
        try {
            if (size <= 0) {
                // If no pagination, get all messages
                List<ChatMessage> messages = chatService.getChatMessages(roomId);
                return ResponseEntity.ok(ApiResponse.success("Messages retrieved", messages));
            } else {
                // Use pagination
                Pageable pageable = PageRequest.of(page, size);
                Page<ChatMessage> messages = chatService.getChatMessages(roomId, pageable);
                return ResponseEntity.ok(ApiResponse.success("Messages retrieved", messages));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error retrieving messages: " + e.getMessage()));
        }
    }
    
    // Mark messages as read
    @PutMapping("/room/{roomId}/read")
    @PreAuthorize("hasRole('USER') or hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<?> markMessagesAsRead(@PathVariable Long roomId,
                                              Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            int markedCount = chatService.markMessagesAsRead(roomId, userPrincipal.getId());
            
            Map<String, Object> result = new HashMap<>();
            result.put("markedCount", markedCount);
            
            return ResponseEntity.ok(ApiResponse.success("Messages marked as read", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error marking messages as read: " + e.getMessage()));
        }
    }
    
    // Get unread message count
    @GetMapping("/room/{roomId}/unread-count")
    @PreAuthorize("hasRole('USER') or hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<?> getUnreadCount(@PathVariable Long roomId,
                                          Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            long unreadCount = chatService.countUnreadMessages(roomId, userPrincipal.getId());
            
            Map<String, Object> result = new HashMap<>();
            result.put("unreadCount", unreadCount);
            
            return ResponseEntity.ok(ApiResponse.success("Unread count retrieved", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error getting unread count: " + e.getMessage()));
        }
    }
    
    // Get user's chat rooms
    @GetMapping("/rooms")
    @PreAuthorize("hasRole('USER') or hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<?> getUserChatRooms(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            List<ChatRoom> chatRooms = chatService.getUserChatRooms(userPrincipal.getId());
            
            return ResponseEntity.ok(ApiResponse.success("Chat rooms retrieved", chatRooms));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error retrieving chat rooms: " + e.getMessage()));
        }
    }
    
    // Get active chat rooms (for admin/volunteer dashboard)
    @GetMapping("/rooms/active")
    @PreAuthorize("hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<?> getActiveChatRooms() {
        try {
            List<ChatRoom> activeChatRooms = chatService.getActiveChatRooms();
            return ResponseEntity.ok(ApiResponse.success("Active chat rooms retrieved", activeChatRooms));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error retrieving active chat rooms: " + e.getMessage()));
        }
    }
    
    // Close chat room
    @PutMapping("/room/{roomId}/close")
    @PreAuthorize("hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<?> closeChatRoom(@PathVariable Long roomId) {
        try {
            ChatRoom chatRoom = chatService.closeChatRoom(roomId);
            return ResponseEntity.ok(ApiResponse.success("Chat room closed", chatRoom));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error closing chat room: " + e.getMessage()));
        }
    }
}
