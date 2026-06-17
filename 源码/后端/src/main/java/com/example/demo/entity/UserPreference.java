package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_preferences")
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;

    @Column(columnDefinition = "TEXT")
    private String preferenceText;

    private LocalDateTime createdAt;

    public UserPreference() {}

    public UserPreference(String username, String preferenceText) {
        this.username = username;
        this.preferenceText = preferenceText;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getPreferenceText() { return preferenceText; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
