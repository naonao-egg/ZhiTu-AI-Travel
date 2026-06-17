package com.example.demo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class ImageSearchService {

    @Value("${pexels.api.key}")
    private String pexelsApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // 通用高品质风景图池，防止图片重复
    private static final String[] DEFAULT_URLS = {
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format",
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format",
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format",
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format",
        "https://images.unsplash.com/photo-1532274402911-5a33904d2824?q=80&w=800&auto=format",
        "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=800&auto=format",
        "https://images.unsplash.com/photo-1500673922987-e212871fec22?q=80&w=800&auto=format",
        "https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=800&auto=format"
    };

    public String searchImage(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) return getDefaultImage("random");
        
        try {
            RestClient client = RestClient.create();
            String response = client.get()
                .uri("https://api.pexels.com/v1/search?query=" + keyword + "&per_page=1")
                .header("Authorization", pexelsApiKey)
                .retrieve()
                .body(String.class);
                
            String imageUrl = extractPexelsUrl(response);
            return imageUrl != null ? imageUrl : getDefaultImage(keyword);
        } catch (Exception e) {
            return getDefaultImage(keyword);
        }
    }

    private String extractPexelsUrl(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode photos = root.path("photos");
            if (photos.isArray() && photos.size() > 0) {
                return photos.get(0).path("src").path("large").asText();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    // 利用哈希分配逻辑，确保不同地点显示不同兜底图
    public String getDefaultImage(String keyword) {
        int index = Math.abs(keyword.hashCode()) % DEFAULT_URLS.length;
        return DEFAULT_URLS[index];
    }
}
