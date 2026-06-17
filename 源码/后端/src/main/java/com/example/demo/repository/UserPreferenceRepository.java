package com.example.demo.repository;

import com.example.demo.entity.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserPreferenceRepository extends JpaRepository<UserPreference, Long> {
    List<UserPreference> findByUsernameOrderByCreatedAtDesc(String username);
}
