'use client';

import React, { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { apiClient } from '../services/api.service';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://chatbot-m2lx.onrender.com/api/v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, logout, setLoading } = useAuthStore();
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    async function initAuth() {
      try {
        setLoading(true);
        // Attempt to refresh token or fetch current profile
        const refreshRes = await fetch(`${baseURL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          if (refreshData.success && refreshData.data?.accessToken) {
            const token = refreshData.data.accessToken;
            // Fetch profile
            const profileRes = await apiClient.get<any>('/users/me', {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (profileRes.success && profileRes.data) {
              setAuth(profileRes.data, token);
              return;
            }
          }
        }
        logout();
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, [setAuth, logout, setLoading]);

  return <>{children}</>;
}
