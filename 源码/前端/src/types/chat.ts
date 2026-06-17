export interface WeatherInfo {
  city: string;
  condition: string;
  temperature: string;
  advice: string;
}

export interface RecommendationCard {
  id: string;
  title: string;
  tags: string;
  description: string;
  imageUrl: string;
  rating: number;
  travelTimeToNext?: string;
}

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  type: 'text' | 'recommendations';
  recommendations?: RecommendationCard[];
  weather?: WeatherInfo;
  timestamp: number;
}
