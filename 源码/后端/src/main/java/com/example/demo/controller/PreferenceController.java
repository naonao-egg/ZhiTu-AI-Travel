package com.example.demo.controller;

import com.example.demo.entity.UserPreference;
import com.example.demo.repository.UserPreferenceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/preferences")
public class PreferenceController {

    private final UserPreferenceRepository userPreferenceRepository;

    public PreferenceController(UserPreferenceRepository userPreferenceRepository) {
        this.userPreferenceRepository = userPreferenceRepository;
    }

    @GetMapping
    public List<UserPreference> getPreferences(@RequestParam(defaultValue = "guest") String username) {
        return userPreferenceRepository.findByUsernameOrderByCreatedAtDesc(username);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePreference(@PathVariable Long id) {
        userPreferenceRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
