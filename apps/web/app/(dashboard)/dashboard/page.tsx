'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useChatStore } from '@/stores/chat.store';
import { apiClient } from '@/services/api.service';
import { useAuthStore } from '@/stores/auth.store';
import { Message, Conversation } from '@chatbot/types';
import { ChatWindow } from '@/components/chat/chat-window';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [toolSteps, setToolSteps] = useState<any[]>([]);
  const [optimisticUserMsg, setOptimisticUserMsg] = useState<Message | null>(null);

  const {
    activeConversationId,
    setActiveConversationId,
    model,
    systemPrompt,
    temperature,
    startStreaming,
    appendStreamingContent,
    stopStreaming,
  } = useChatStore();

  const { data: conversationData } = useQuery({
    queryKey: ['conversation', activeConversationId],
    queryFn: async () => {
      if (!activeConversationId) return null;
      const res = await apiClient.get<Conversation>(`/conversations/${activeConversationId}`);
      return res.data;
    },
    enabled: !!activeConversationId,
  });

  const rawMessages: Message[] = conversationData?.messages || [];
  const messages: Message[] = optimisticUserMsg
    ? [...rawMessages.filter((m) => m.id !== optimisticUserMsg.id), optimisticUserMsg]
    : rawMessages;

  const handleSendMessage = async (content: string, attachmentIds: string[]) => {
    const abortController = new AbortController();
    const tempAssistantId = Math.random().toString(36).substring(2, 9);
    const tempUserId = Math.random().toString(36).substring(2, 9);

    const tempUserMessage: Message = {
      id: tempUserId,
      conversationId: activeConversationId || 'temp',
      role: 'USER',
      content,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setOptimisticUserMsg(tempUserMessage);

    setToolSteps([]);
    startStreaming(tempAssistantId, abortController);

    const token = useAuthStore.getState().accessToken;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

    try {
      const response = await fetch(`${apiUrl}/chat/stream`, {
        method: 'POST',
        headers,
        credentials: 'include',
        signal: abortController.signal,
        body: JSON.stringify({
          conversationId: activeConversationId || undefined,
          message: content,
          model,
          attachmentIds,
          systemPrompt: systemPrompt || undefined,
          temperature,
        }),
      });

      if (!response.ok || !response.body) {
        stopStreaming();
        setOptimisticUserMsg(null);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.substring(6).trim();
            if (!dataStr) continue;

            try {
              const event = JSON.parse(dataStr);
              if (event.type === 'start') {
                if (event.isNewConversation && event.conversationId) {
                  setActiveConversationId(event.conversationId);
                }
                if (event.toolSteps && event.toolSteps.length > 0) {
                  setToolSteps(event.toolSteps);
                }
              } else if (event.type === 'chunk') {
                appendStreamingContent(event.delta);
              } else if (event.type === 'done') {
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
                if (event.conversationId) {
                  queryClient.invalidateQueries({ queryKey: ['conversation', event.conversationId] });
                }
              }
            } catch {
              // Ignore
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Chat error:', err);
      }
    } finally {
      stopStreaming();
      setOptimisticUserMsg(null);
    }
  };

  const handleRegenerate = async (messageId: string) => {
    const abortController = new AbortController();
    const tempAssistantId = Math.random().toString(36).substring(2, 9);
    setToolSteps([]);
    startStreaming(tempAssistantId, abortController);

    const token = useAuthStore.getState().accessToken;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

    try {
      const response = await fetch(`${apiUrl}/chat/regenerate`, {
        method: 'POST',
        headers,
        credentials: 'include',
        signal: abortController.signal,
        body: JSON.stringify({ messageId }),
      });

      if (!response.ok || !response.body) {
        stopStreaming();
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.substring(6).trim();
            if (!dataStr) continue;

            try {
              const event = JSON.parse(dataStr);
              if (event.type === 'chunk') {
                appendStreamingContent(event.delta);
              } else if (event.type === 'done') {
                queryClient.invalidateQueries({ queryKey: ['conversation', activeConversationId] });
              }
            } catch {
              // Ignore
            }
          }
        }
      }
    } catch {
      // Ignore
    } finally {
      stopStreaming();
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await apiClient.delete(`/messages/${messageId}`);
      queryClient.invalidateQueries({ queryKey: ['conversation', activeConversationId] });
    } catch {
      // Ignore
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] -m-6 md:-m-8 flex flex-col min-w-0 overflow-hidden">
      <ChatWindow
        messages={messages}
        title={conversationData?.title}
        toolSteps={toolSteps}
        onSendMessage={handleSendMessage}
        onRegenerate={handleRegenerate}
        onDeleteMessage={handleDeleteMessage}
      />
    </div>
  );
}
