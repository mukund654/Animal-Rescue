package com.animalhealthcare.controller;

import com.animalhealthcare.dto.ApiResponse;
import com.animalhealthcare.entity.Role;
import com.animalhealthcare.entity.User;
import com.animalhealthcare.security.UserPrincipal;
import com.animalhealthcare.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    // Get current user profile
    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userService.findById(userPrincipal.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Remove password from response
            user.setPassword(null);
            
            return ResponseEntity.ok(ApiResponse.success("User profile retrieved", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error retrieving user profile: " + e.getMessage()));
        }
    }
    
    // Get all users (Admin only)
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userService.findAllUsers();
            // Remove passwords from response
            users.forEach(user -> user.setPassword(null));
            
            return ResponseEntity.ok(ApiResponse.success("All users retrieved", users));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error retrieving users: " + e.getMessage()));
        }
    }
    
    // Get all volunteers (Admin/Volunteer only)
    @GetMapping("/volunteers")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VOLUNTEER')")
    public ResponseEntity<?> getAllVolunteers() {
        try {
            List<User> volunteers = userService.findVolunteers();
            // Remove passwords from response
            volunteers.forEach(user -> user.setPassword(null));
            
            return ResponseEntity.ok(ApiResponse.success("Volunteers retrieved", volunteers));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error retrieving volunteers: " + e.getMessage()));
        }
    }
    
    // Search volunteers by name (Admin/Volunteer only)
    @GetMapping("/volunteers/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VOLUNTEER')")
    public ResponseEntity<?> searchVolunteers(@RequestParam String search) {
        try {
            List<User> volunteers = userService.findVolunteersBySearch(search);
            // Remove passwords from response
            volunteers.forEach(user -> user.setPassword(null));
            
            return ResponseEntity.ok(ApiResponse.success("Volunteers search results", volunteers));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error searching volunteers: " + e.getMessage()));
        }
    }
    
    // Get users by role (Admin only)
    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUsersByRole(@PathVariable String role) {
        try {
            Role userRole = Role.valueOf(role.toUpperCase());
            List<User> users = userService.findUsersByRole(userRole);
            // Remove passwords from response
            users.forEach(user -> user.setPassword(null));
            
            return ResponseEntity.ok(ApiResponse.success("Users by role retrieved", users));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error retrieving users by role: " + e.getMessage()));
        }
    }
    
    // Search users by name (Admin only)
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> searchUsers(@RequestParam String name) {
        try {
            List<User> users = userService.findUsersByName(name);
            // Remove passwords from response
            users.forEach(user -> user.setPassword(null));
            
            return ResponseEntity.ok(ApiResponse.success("User search results", users));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error searching users: " + e.getMessage()));
        }
    }
    
    // Update user profile
    @PutMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('VOLUNTEER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateProfile(@RequestBody User updatedUser, Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User currentUser = userService.findById(userPrincipal.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Update allowed fields only
            if (updatedUser.getFullName() != null) {
                currentUser.setFullName(updatedUser.getFullName());
            }
            if (updatedUser.getPhone() != null) {
                currentUser.setPhone(updatedUser.getPhone());
            }
            if (updatedUser.getEmail() != null && !userService.existsByEmail(updatedUser.getEmail())) {
                currentUser.setEmail(updatedUser.getEmail());
            }
            
            User savedUser = userService.updateUser(currentUser);
            savedUser.setPassword(null); // Remove password from response
            
            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", savedUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error updating profile: " + e.getMessage()));
        }
    }
    
    // Get user by ID (Admin only)
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userService.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            user.setPassword(null); // Remove password from response
            
            return ResponseEntity.ok(ApiResponse.success("User retrieved", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error retrieving user: " + e.getMessage()));
        }
    }
    
    // Delete user (Admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error deleting user: " + e.getMessage()));
        }
    }
    
    // Update user role (Admin only)
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestParam String role) {
        try {
            User user = userService.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Role newRole = Role.valueOf(role.toUpperCase());
            user.setRole(newRole);
            
            User updatedUser = userService.updateUser(user);
            updatedUser.setPassword(null); // Remove password from response
            
            return ResponseEntity.ok(ApiResponse.success("User role updated successfully", updatedUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error updating user role: " + e.getMessage()));
        }
    }
}
