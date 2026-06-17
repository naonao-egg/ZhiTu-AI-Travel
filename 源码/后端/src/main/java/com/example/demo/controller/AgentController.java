package com.example.demo.controller;

import com.example.demo.dto.TravelResponse;
import com.example.demo.dto.Card;
import com.example.demo.config.AiTools;
import com.example.demo.entity.HistoryRecord;
import com.example.demo.entity.UserPreference;
import com.example.demo.repository.HistoryRecordRepository;
import com.example.demo.repository.UserPreferenceRepository;
import com.example.demo.service.ImageSearchService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api")
public class AgentController {

    private final ChatClient chatClient;
    private final AiTools aiTools;
    private final ImageSearchService imageSearchService;
    private final ChatMemory chatMemory;
    private final HistoryRecordRepository historyRecordRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AgentController(ChatClient.Builder chatClientBuilder, 
                           AiTools aiTools, 
                           ImageSearchService imageSearchService,
                           ChatMemory chatMemory,
                           HistoryRecordRepository historyRecordRepository,
                           UserPreferenceRepository userPreferenceRepository) {
        this.chatClient = chatClientBuilder.build();
        this.aiTools = aiTools;
        this.imageSearchService = imageSearchService;
        this.chatMemory = chatMemory;
        this.historyRecordRepository = historyRecordRepository;
        this.userPreferenceRepository = userPreferenceRepository;
    }

    @GetMapping("/chat")
    public TravelResponse chat(@RequestParam String message, 
                              @RequestParam(defaultValue = "guest") String username,
                              @RequestParam(required = false) String tripId) {
        
        // 确保 tripId 有默认值，避免作为 memory key 时出错
        String sessionId = (tripId == null || tripId.isEmpty()) ? "default-trip" : tripId;

        // 获取长期记忆（用户偏好）
        List<UserPreference> prefs = userPreferenceRepository.findByUsernameOrderByCreatedAtDesc(username);
        String preferenceStr = "";
        if (!prefs.isEmpty()) {
            List<String> prefTexts = prefs.stream().map(UserPreference::getPreferenceText).toList();
            preferenceStr = "\n【注意：已知该用户的长期喜好/画像为：" + String.join("，", prefTexts) + "。请在规划行程、推荐美食和写建议时，务必严格遵循这些喜好！】\n";
        }

        try {
            BeanOutputConverter<TravelResponse> converter = new BeanOutputConverter<>(TravelResponse.class);
            String format = converter.getFormat();

            String promptText = """
                    你叫“智途”，顶级旅行向导。语气幽默、地道。%s
                    
                    【核心规则】
                    1. 必须只返回合法的 JSON。禁止任何开场白或结尾。
                    2. 如果用户想去哪玩，cards 数组必须包含 4-6 个地点。
                    3. 每个地点的 description 必须包含至少 40 字的生动介绍。
                    4. 必须调用 `imageSearchSkill` 获取真实图片链接填入 image 字段。
                    5. cards 数组中必须是对象，严禁直接放入字符串。
                    6. cards 数组中的每个对象必须提供 travelTimeToNext 字段，由你根据常识编造前往下一站的预估交通方式和时间（例如："步行 10 分钟"、"驾车 30 分钟"），如果是最后一站则填空字符串。
                    7. 如果用户询问了具体城市的行程或天气，请在 JSON 根节点提供 weather 对象，包含 city, condition, temperature, advice（基于真实气象数据的穿衣/带伞等建议）。否则返回 null。
                    8. 仔细分析用户的输入，如果用户表达了长期的个人喜好（例如：不吃辣、带了小孩、喜欢自然风光、预算有限等），请提取这些喜好（每个喜好用简短的词或短语表示），放在 JSON 根节点的 extractedPreferences 数组中。如果本次对话没有明显的长期喜好，则返回空数组 []。
                    
                    【输出格式】
                    %s
                    
                    用户的输入是：%s
                    """.formatted(preferenceStr, format, message);

            // 1. 获取短期记忆（由 tripId 隔离）
            List<org.springframework.ai.chat.messages.Message> history = chatMemory.get(sessionId);
            if (history.size() > 10) history = history.subList(history.size() - 10, history.size());

            // 2. 调用模型
            String rawResponse = chatClient.prompt()
                    .messages(history)
                    .user(promptText)
                    .tools(aiTools)
                    .call()
                    .content();

            System.out.println("=== [智途 AI 原始响应] ===");
            System.out.println(rawResponse);
            System.out.println("==========================");

            if (rawResponse == null || rawResponse.trim().isEmpty()) {
                return new TravelResponse("智途刚才发了个呆，没能生成回复。", null, new ArrayList<>(), new ArrayList<>());
            }

            // 强力 JSON 提取
            String cleanedJson = "";
            Pattern pattern = Pattern.compile("\\{.*\\}", Pattern.DOTALL);
            Matcher matcher = pattern.matcher(rawResponse);
            if (matcher.find()) {
                cleanedJson = matcher.group();
            } else {
                return new TravelResponse("哎呀，智途刚才排版乱了。再试一次吧？🥺", null, new ArrayList<>(), new ArrayList<>());
            }

            TravelResponse response = converter.convert(cleanedJson);
            if (response == null) {
                return new TravelResponse("智途生成的格式不对，请再试一次。", null, new ArrayList<>(), new ArrayList<>());
            }

            // 数据纠偏与图片补全
            List<Card> updatedCards = new ArrayList<>();
            if (response.cards() != null) {
                updatedCards = response.cards().stream().map(card -> {
                    String realImage = imageSearchService.searchImage(card.title()); 
                    return new Card(card.time(), card.title(), card.tags(), card.rating(), realImage, card.description(), card.travelTimeToNext());
                }).toList();
            }

            TravelResponse finalResponse = new TravelResponse(response.text(), response.weather(), updatedCards, response.extractedPreferences());

            // 提取并保存长期偏好
            if (finalResponse.extractedPreferences() != null && !finalResponse.extractedPreferences().isEmpty()) {
                for (String pref : finalResponse.extractedPreferences()) {
                    userPreferenceRepository.save(new UserPreference(username, pref));
                }
            }

            // 3. 记忆回写
            chatMemory.add(sessionId, List.of(
                new org.springframework.ai.chat.messages.UserMessage(message),
                new org.springframework.ai.chat.messages.AssistantMessage(rawResponse)
            ));

            // 4. 补全落盘保存 (Save to H2)
            if (!updatedCards.isEmpty()) {
                try {
                    // 将完整的 TravelResponse 对象序列化为 JSON 字符串
                    String itineraryJson = objectMapper.writeValueAsString(finalResponse);
                    // 创建 HistoryRecord 并持久化
                    HistoryRecord record = new HistoryRecord(username, sessionId, message, itineraryJson);
                    historyRecordRepository.save(record);
                    System.out.println("已成功保存行程历史: " + username + " - " + sessionId);
                } catch (Exception e) {
                    System.err.println("持久化保存失败: " + e.getMessage());
                }
            }

            return finalResponse;
        } catch (Exception e) {
            e.printStackTrace();
            return new TravelResponse("哎呀，智途刚才排版乱了。能换个说法问我吗？🥺", null, new ArrayList<>(), new ArrayList<>());
        }
    }

    @GetMapping("/history")
    public List<HistoryRecord> getHistory(@RequestParam String username) {
        return historyRecordRepository.findByUsernameOrderByCreatedAtDesc(username);
    }

    @DeleteMapping("/history/{id}")
    public org.springframework.http.ResponseEntity<?> deleteHistory(@PathVariable Long id) {
        historyRecordRepository.deleteById(id);
        return org.springframework.http.ResponseEntity.ok().build();
    }
}
