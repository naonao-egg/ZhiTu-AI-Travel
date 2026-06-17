package com.example.demo.config;

import com.example.demo.service.ImageSearchService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.zip.GZIPInputStream;
import java.io.ByteArrayInputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;

/**
 * 专门用于存放 AI 工具（技能）的组件
 * 使用 @Component 避免被 CGLIB 代理导致 @Tool 识别失败
 */
@Component
public class AiTools {

    private final ImageSearchService imageSearchService;
    private final RestClient restClient = RestClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();
    // 替换为您的和风天气 API Key
    private final String QWEATHER_KEY = "4d6ff29dabb4440a9ce6d156bc64a656";

    public AiTools(ImageSearchService imageSearchService) {
        this.imageSearchService = imageSearchService;
    }

    // 1. 天气技能 - 接入和风天气真实数据
    @Tool(description = "获取指定城市的实时天气情况，返回真实气象数据")
    public String weatherFunction(String city) {
        try {
            // 第一步：通过 GeoAPI 获取 Location ID
            String encodedCity = java.net.URLEncoder.encode(city, "UTF-8");
            String geoUrl = "https://jv564wa88b.re.qweatherapi.com/geo/v2/city/lookup?location=" + encodedCity + "&key=" + QWEATHER_KEY;
            String geoResponse = fetchAndDecompress(geoUrl);
            JsonNode geoJson = objectMapper.readTree(geoResponse);
            
            if (!"200".equals(geoJson.path("code").asText())) {
                return "无法获取城市信息";
            }
            
            String locationId = geoJson.path("location").get(0).path("id").asText();
            String cityName = geoJson.path("location").get(0).path("name").asText();

            // 第二步：通过 Location ID 获取实时天气
            String weatherUrl = "https://jv564wa88b.re.qweatherapi.com/v7/weather/now?location=" + locationId + "&key=" + QWEATHER_KEY;
            String weatherResponse = fetchAndDecompress(weatherUrl);
            JsonNode weatherJson = objectMapper.readTree(weatherResponse);

            if (!"200".equals(weatherJson.path("code").asText())) {
                return "天气数据获取失败";
            }

            JsonNode now = weatherJson.path("now");
            String text = now.path("text").asText();
            String temp = now.path("temp").asText();
            String windDir = now.path("windDir").asText();
            String windScale = now.path("windScale").asText();
            
            return cityName + "当前真实天气：" + text + "，温度：" + temp + "℃，" + windDir + " " + windScale + "级。请在生成行程或建议时参考此天气数据（例如：如下雨提醒带伞或调整室外行程）。";
        } catch (Exception e) {
            e.printStackTrace();
            return "天气数据暂时无法获取";
        }
    }

    private String fetchAndDecompress(String urlStr) throws Exception {
        byte[] compressed = restClient.get().uri(urlStr).retrieve().body(byte[].class);
        if (compressed == null || compressed.length == 0) return "";
        // Check for GZIP magic number 0x1F8B
        if (compressed.length > 2 && compressed[0] == (byte) 0x1F && compressed[1] == (byte) 0x8B) {
            try (GZIPInputStream gis = new GZIPInputStream(new ByteArrayInputStream(compressed));
                 BufferedReader br = new BufferedReader(new InputStreamReader(gis, "UTF-8"))) {
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = br.readLine()) != null) {
                    sb.append(line);
                }
                return sb.toString();
            }
        }
        return new String(compressed, "UTF-8");
    }

    // 2. 风景图技能
    @Tool(name = "imageSearchSkill", description = "获取景点的高清图片。")
    public String imageSearchSkill(String keyword) {
        return imageSearchService.searchImage(keyword);
    }
}
