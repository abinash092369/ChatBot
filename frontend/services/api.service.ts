import { ApiClient } from '@/lib/api-client';
import { useAuthStore } from '../stores/auth.store';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = new ApiClient({
  baseURL,
  getAccessToken: () => useAuthStore.getState().accessToken,
  onRefreshToken: async () => {
    try {
      const response = await fetch(`${baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (data.success && data.data?.accessToken) {
        useAuthStore.getState().setAccessToken(data.data.accessToken);
        return data.data.accessToken;
      }
      return null;
    } catch {
      return null;
    }
  },
  onAuthError: () => {
    useAuthStore.getState().logout();
  },
});
