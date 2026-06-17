package com.example.demo.repository;

import com.example.demo.entity.HistoryRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HistoryRecordRepository extends JpaRepository<HistoryRecord, Long> {
    List<HistoryRecord> findByUsernameOrderByCreatedAtDesc(String username);
}
