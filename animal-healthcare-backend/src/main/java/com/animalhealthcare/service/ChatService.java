package com.animalhealthcare.service;

import com.animalhealthcare.entity.*;
import com.animalhealthcare.repository.ChatMessageRepository;
import com.animalhealthcare.repository.ChatRoomRepository;
import com.animalhealthcare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ChatService {
    
    @Autowired
    private ChatRoomRepository chatRoomRepository;
    
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // Create or get chat room for emergency request
    public ChatRoom createOrGetChatRoom(String emergencyRequestId, Long userId) {
        Optional<ChatRoom> existingRoom = chatRoomRepository.findByEmergencyRequestId(emergencyRequestId);
        
        if (existingRoom.isPresent()) {
            return existingRoom.get();
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        ChatRoom chatRoom = new ChatRoom(emergencyRequestId, user);
        return chatRoomRepository.save(chatRoom);
    }
    
    // Assign volunteer to chat room
    public ChatRoom assignVolunteer(Long chatRoomId, Long volunteerId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        
        User volunteer = userRepository.findById(volunteerId)
                .orElseThrow(() -> new RuntimeException("Volunteer not found"));
        
        if (volunteer.getRole() != Role.VOLUNTEER && volunteer.getRole() != Role.ADMIN) {
            throw new RuntimeException("User is not a volunteer or admin");
        }
        
        chatRoom.setVolunteer(volunteer);
        chatRoom.setUpdatedAt(LocalDateTime.now());
        
        // Send system message about volunteer assignment
        ChatMessage systemMessage = new ChatMessage(
            chatRoom, 
            volunteer, 
            "Volunteer " + volunteer.getFullName() + " has joined the chat.", 
            SenderType.SYSTEM
        );
        systemMessage.setMessageType(MessageType.SYSTEM);
        chatMessageRepository.save(systemMessage);
        
        return chatRoomRepository.save(chatRoom);
    }
    
    // Send message
    public ChatMessage sendMessage(Long chatRoomId, Long senderId, String message) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        
        // Determine sender type
        SenderType senderType = SenderType.USER;
        if (sender.getRole() == Role.VOLUNTEER) {
            senderType = SenderType.VOLUNTEER;
        } else if (sender.getRole() == Role.ADMIN) {
            senderType = SenderType.ADMIN;
        }
        
        ChatMessage chatMessage = new ChatMessage(chatRoom, sender, message, senderType);
        chatMessage.setMessageType(MessageType.TEXT);
        
        // Update chat room's last activity
        chatRoom.setUpdatedAt(LocalDateTime.now());
        chatRoomRepository.save(chatRoom);
        
        return chatMessageRepository.save(chatMessage);
    }
    
    // Get chat room by ID
    public Optional<ChatRoom> getChatRoom(Long chatRoomId) {
        return chatRoomRepository.findById(chatRoomId);
    }
    
    // Get chat room by emergency request ID
    public Optional<ChatRoom> getChatRoomByEmergencyId(String emergencyRequestId) {
        return chatRoomRepository.findByEmergencyRequestId(emergencyRequestId);
    }
    
    // Get user's chat rooms
    public List<ChatRoom> getUserChatRooms(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return chatRoomRepository.findByUserOrVolunteer(user);
    }
    
    // Get messages for a chat room
    public List<ChatMessage> getChatMessages(Long chatRoomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        
        return chatMessageRepository.findByChatRoomOrderByCreatedAtAsc(chatRoom);
    }
    
    // Get messages with pagination
    public Page<ChatMessage> getChatMessages(Long chatRoomId, Pageable pageable) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        
        return chatMessageRepository.findByChatRoomOrderByCreatedAtDesc(chatRoom, pageable);
    }
    
    // Mark messages as read
    public int markMessagesAsRead(Long chatRoomId, Long userId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return chatMessageRepository.markMessagesAsRead(chatRoom, user);
    }
    
    // Count unread messages
    public long countUnreadMessages(Long chatRoomId, Long userId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return chatMessageRepository.countUnreadMessages(chatRoom, user);
    }
    
    // Close chat room
    public ChatRoom closeChatRoom(Long chatRoomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        
        chatRoom.setStatus(ChatStatus.CLOSED);
        chatRoom.setUpdatedAt(LocalDateTime.now());
        
        return chatRoomRepository.save(chatRoom);
    }
    
    // Get active chat rooms (for admin/volunteer view)
    public List<ChatRoom> getActiveChatRooms() {
        return chatRoomRepository.findActiveChatRooms();
    }
}
