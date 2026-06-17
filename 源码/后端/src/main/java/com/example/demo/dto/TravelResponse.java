package com.example.demo.dto;

import java.util.List;

public record TravelResponse(String text, WeatherInfo weather, List<Card> cards, List<String> extractedPreferences) {
}
