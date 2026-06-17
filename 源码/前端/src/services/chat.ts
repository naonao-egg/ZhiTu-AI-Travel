import { Message, RecommendationCard } from '../types/chat';

// Base URL for Spring Boot backend
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Service to handle chat interactions with the Spring Boot backend.
 */
export const chatService = {
  /**
   * Sends a message to the AI agent and gets a response.
   * @param content The user's message content
   * @returns A promise that resolves to the AI's response message
   */
  async sendMessage(content: string, tripId: string, username?: string): Promise<Message> {
    try {
      // Including username and tripId for complete backend session tracking
      const response = await fetch(`${API_BASE_URL}/chat?message=${encodeURIComponent(content)}&username=${username || 'guest'}&tripId=${tripId}`);

      if (!response.ok) {
        throw new Error('网络响应异常');
      }

      const data = await response.json();

      // Transform backend response to frontend Message structure
      // Backend: { text: string, cards: Array<{title, tags, rating, image}> }
      const recommendations: RecommendationCard[] = (data.cards || []).map((card: any, index: number) => ({
        id: `rec-${Date.now()}-${index}`,
        title: card.title,
        tags: card.tags || '',
        description: card.description || '',
        imageUrl: card.image,
        rating: card.rating,
        travelTimeToNext: card.travelTimeToNext,
      }));

      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.text,
        type: recommendations.length > 0 ? 'recommendations' : 'text',
        recommendations: recommendations.length > 0 ? recommendations : undefined,
        weather: data.weather,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  /**
   * Fetches initial messages.
   */
  async getInitialMessages(): Promise<Message[]> {
    return [
      {
        id: '1',
        role: 'assistant',
        content: '你好！我是你的旅游助手。准备好开启下一段旅程了吗？✈️',
        type: 'text',
        timestamp: Date.now(),
      },
    ];
  },
};
