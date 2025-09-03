package com.animalhealthcare.dto;

import jakarta.validation.constraints.NotBlank;

public class EmergencyRequestDto {
    
    @NotBlank(message = "Animal type is required")
    private String animalType;
    
    @NotBlank(message = "Urgency is required")
    private String urgency;
    
    @NotBlank(message = "Location is required")
    private String location;
    
    @NotBlank(message = "Contact name is required")
    private String contactName;
    
    @NotBlank(message = "Contact phone is required")
    private String contactPhone;
    
    private String contactEmail;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    // Constructors
    public EmergencyRequestDto() {}
    
    public EmergencyRequestDto(String animalType, String urgency, String location, 
                             String contactName, String contactPhone, String description) {
        this.animalType = animalType;
        this.urgency = urgency;
        this.location = location;
        this.contactName = contactName;
        this.contactPhone = contactPhone;
        this.description = description;
    }
    
    // Getters and Setters
    public String getAnimalType() { return animalType; }
    public void setAnimalType(String animalType) { this.animalType = animalType; }
    
    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }
    
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
