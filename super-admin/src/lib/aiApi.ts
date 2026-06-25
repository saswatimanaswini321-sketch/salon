import { fetchWithAuth } from './api';

export interface AiSetting {
  id: string;
  key: string;
  value: string;
}

export interface AiPrompt {
  id: string;
  type: string;
  promptText: string;
}

export interface AiUsage {
  id: string;
  salonId: string;
  tokensUsed: number;
  apiCalls: number;
  dailyLimit: number;
  monthlyLimit: number;
  isBlocked: boolean;
}

export const AiEngineApi = {
  // --- Settings / Keys ---
  getSettings: async (): Promise<AiSetting[]> => {
    return fetchWithAuth('/admin/ai/settings');
  },

  updateSetting: async (key: string, value: string): Promise<AiSetting> => {
    return fetchWithAuth('/admin/ai/settings', {
      method: 'PUT',
      body: JSON.stringify({ key, value }),
    });
  },

  // --- Prompts ---
  getPrompts: async (): Promise<AiPrompt[]> => {
    return fetchWithAuth('/admin/ai/prompts');
  },

  updatePrompt: async (type: string, promptText: string): Promise<AiPrompt> => {
    return fetchWithAuth(`/admin/ai/prompts/${type}`, {
      method: 'PUT',
      body: JSON.stringify({ promptText }),
    });
  },

  // --- Generation (Mock) ---
  generateImage: async (payload: { salonId: string; gender: string; styleType: string; styleName: string; image?: string }) => {
    return fetchWithAuth('/admin/ai/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // --- Usage Management ---
  getUsage: async (salonId: string): Promise<AiUsage> => {
    return fetchWithAuth(`/admin/ai/usage/${salonId}`);
  },

  updateUsageLimits: async (salonId: string, limits: { dailyLimit?: number; monthlyLimit?: number; isBlocked?: boolean }): Promise<AiUsage> => {
    return fetchWithAuth(`/admin/ai/usage/${salonId}/limits`, {
      method: 'PUT',
      body: JSON.stringify(limits),
    });
  },
};
