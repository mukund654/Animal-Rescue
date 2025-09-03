-- =====================================================
-- Animal Rescue Chat System Database Migration
-- Run this entire script in MySQL Workbench
-- =====================================================

-- Select the correct database
USE animalrescue;

-- Show current database
SELECT DATABASE() as 'Current Database';

-- Show existing tables
SHOW TABLES;

-- Drop existing chat tables if they exist (for fresh start)
DROP TABLE IF EXISTS message_read_status;
DROP TABLE IF EXISTS chat_participants;
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS chat_rooms;

-- Chat rooms/conversations table
CREATE TABLE chat_rooms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    emergency_request_id VARCHAR(50) NOT NULL,
    user_id BIGINT NOT NULL,
    volunteer_id BIGINT NULL,
    status ENUM('ACTIVE', 'CLOSED', 'ARCHIVED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (volunteer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_emergency_request (emergency_request_id),
    INDEX idx_user_volunteer (user_id, volunteer_id),
    INDEX idx_status (status)
);

-- Chat messages table
CREATE TABLE chat_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    chat_room_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    sender_type ENUM('USER', 'VOLUNTEER', 'ADMIN') NOT NULL,
    message TEXT NOT NULL,
    message_type ENUM('TEXT', 'IMAGE', 'FILE', 'SYSTEM') DEFAULT 'TEXT',
    file_url VARCHAR(500) NULL,
    file_name VARCHAR(255) NULL,
    file_size BIGINT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP NULL,
    
    FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_chat_room_created (chat_room_id, created_at),
    INDEX idx_sender (sender_id),
    INDEX idx_unread (chat_room_id, is_read)
);

-- Chat room participants (for group chats if needed later)
CREATE TABLE chat_participants (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    chat_room_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role ENUM('ADMIN', 'VOLUNTEER', 'USER') NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_room_user (chat_room_id, user_id),
    INDEX idx_room_active (chat_room_id, is_active)
);

-- Message read status tracking
CREATE TABLE message_read_status (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    message_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_message_user (message_id, user_id)
);

-- Verify the tables were created
SHOW TABLES;

-- Show table structures
DESCRIBE chat_rooms;
DESCRIBE chat_messages;
DESCRIBE chat_participants;
DESCRIBE message_read_status;

-- Show all existing tables with their types
SELECT 
    TABLE_NAME,
    TABLE_TYPE,
    ENGINE,
    TABLE_ROWS,
    CREATE_TIME
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'animalrescue'
ORDER BY TABLE_NAME;

SELECT '✅ Chat database migration completed successfully!' as 'Status';
