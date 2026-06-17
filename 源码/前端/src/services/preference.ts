export interface UserPreference {
  id: number;
  username: string;
  preferenceText: string;
  createdAt: string;
}

const API_BASE_URL = 'http://localhost:8080/api';

export const preferenceService = {
  getPreferences: async (username: string = 'guest'): Promise<UserPreference[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/preferences?username=${encodeURIComponent(username)}`);
      if (!response.ok) throw new Error('Failed to fetch preferences');
      return await response.json();
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return [];
    }
  },

  deletePreference: async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/preferences/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting preference:', error);
      return false;
    }
  }
};
