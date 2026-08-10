'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useChatStore } from '@/stores/chat.store';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api.service';
import { Spinner } from '@/components/ui/spinner';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processCallback() {
      const token = searchParams.get('token');
      if (!token) {
        router.push('/login?error=missing_token');
        return;
      }

      try {
        const response = await apiClient.get<any>('/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.success && response.data) {
          queryClient.clear();
          useChatStore.getState().resetChatStore();
          setAuth(response.data, token);
          router.push('/dashboard');
        } else {
          router.push('/login?error=user_fetch_failed');
        }
      } catch (err: any) {
        setError(err.message || 'Authentication failed');
        setTimeout(() => router.push('/login'), 2000);
      }
    }

    processCallback();
  }, [searchParams, router, setAuth, queryClient]);

  return (
    <div className="flex flex-col items-center space-y-4">
      {error ? (
        <div className="p-4 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-sm font-medium">
          {error}
        </div>
      ) : (
        <>
          <Spinner className="h-10 w-10 text-primary" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Authenticating Google Account...
          </p>
        </>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <Suspense fallback={<Spinner className="h-10 w-10 text-primary" />}>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
