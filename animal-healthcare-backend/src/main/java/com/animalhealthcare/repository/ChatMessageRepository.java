package com.animalhealthcare.repository;

import com.animalhealthcare.entity.ChatMessage;
import com.animalhealthcare.entity.ChatRoom;
import com.animalhealthcare.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    // Find messages by chat room, ordered by creation time
    List<ChatMessage> findByChatRoomOrderByCreatedAtAsc(ChatRoom chatRoom);
    
    // Find messages by chat room with pagination
    Page<ChatMessage> findByChatRoomOrderByCreatedAtDesc(ChatRoom chatRoom, Pageable pageable);
    
    // Find unread messages for a user in a specific chat room
    @Query("SELECT m FROM ChatMessage m WHERE m.chatRoom = :chatRoom AND m.sender != :user AND m.isRead = false ORDER BY m.createdAt ASC")
    List<ChatMessage> findUnreadMessages(@Param("chatRoom") ChatRoom chatRoom, @Param("user") User user);
    
    // Count unread messages for a user in a specific chat room
    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.chatRoom = :chatRoom AND m.sender != :user AND m.isRead = false")
    long countUnreadMessages(@Param("chatRoom") ChatRoom chatRoom, @Param("user") User user);
    
    // Mark messages as read for a user in a chat room
    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.chatRoom = :chatRoom AND m.sender != :user AND m.isRead = false")
    int markMessagesAsRead(@Param("chatRoom") ChatRoom chatRoom, @Param("user") User user);
    
    // Find latest message in a chat room
    ChatMessage findFirstByChatRoomOrderByCreatedAtDesc(ChatRoom chatRoom);
    
    // Find messages by sender
    List<ChatMessage> findBySenderOrderByCreatedAtDesc(User sender);
    
    // Count total messages in a chat room
    long countByChatRoom(ChatRoom chatRoom);
}
