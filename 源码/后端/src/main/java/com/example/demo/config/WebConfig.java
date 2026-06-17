package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Collections;

@Configuration
public class WebConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // 允许携带凭证（Cookie等）
        config.setAllowCredentials(true);
        
        // 允许所有来源 (必须配合 allowCredentials 使用具体的 pattern)
        config.setAllowedOriginPatterns(Collections.singletonList("*"));
        
        // 允许所有请求头
        config.setAllowedHeaders(Collections.singletonList("*"));
        
        // 允许所有 HTTP 方法
        config.setAllowedMethods(Collections.singletonList("*"));
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
