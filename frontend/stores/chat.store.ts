import { create } from 'zustand';

export interface PendingFile {
  id: string;
  file: File;
  attachmentId?: string;
  previewUrl?: string;
  isUploading?: boolean;
}

interface ChatState {
  activeConversationId: string | null;
  model: string;
  systemPrompt: string;
  temperature: number;
  isStreaming: boolean;
  streamingMessageId: string | null;
  streamingContent: string;
  abortController: AbortController | null;
  pendingFiles: PendingFile[];

  setActiveConversationId: (id: string | null) => void;
  setModel: (model: string) => void;
  setSystemPrompt: (prompt: string) => void;
  setTemperature: (temp: number) => void;
  startStreaming: (messageId: string, abortController: AbortController) => void;
  appendStreamingContent: (delta: string) => void;
  stopStreaming: () => void;
  addPendingFile: (file: PendingFile) => void;
  updatePendingFile: (id: string, updates: Partial<PendingFile>) => void;
  removePendingFile: (id: string) => void;
  clearPendingFiles: () => void;
  resetChatStore: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  activeConversationId: null,
  model: 'gemini-1.5-flash',
  systemPrompt: '',
  temperature: 0.7,
  isStreaming: false,
  streamingMessageId: null,
  streamingContent: '',
  abortController: null,
  pendingFiles: [],

  setActiveConversationId: (id) => set({ activeConversationId: id }),
  setModel: (model) => set({ model }),
  setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
  setTemperature: (temperature) => set({ temperature }),

  startStreaming: (messageId, abortController) =>
    set({
      isStreaming: true,
      streamingMessageId: messageId,
      streamingContent: '',
      abortController,
    }),

  appendStreamingContent: (delta) =>
    set((state) => ({
      streamingContent: state.streamingContent + delta,
    })),

  stopStreaming: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
    }
    set({
      isStreaming: false,
      streamingMessageId: null,
      streamingContent: '',
      abortController: null,
    });
  },

  addPendingFile: (file) => set((state) => ({ pendingFiles: [...state.pendingFiles, file] })),
  updatePendingFile: (id, updates) =>
    set((state) => ({
      pendingFiles: state.pendingFiles.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),
  removePendingFile: (id) =>
    set((state) => ({
      pendingFiles: state.pendingFiles.filter((f) => f.id !== id),
    })),
  clearPendingFiles: () => set({ pendingFiles: [] }),
  resetChatStore: () =>
    set({
      activeConversationId: null,
      model: 'gemini-1.5-flash',
      systemPrompt: '',
      temperature: 0.7,
      isStreaming: false,
      streamingMessageId: null,
      streamingContent: '',
      abortController: null,
      pendingFiles: [],
    }),
}));
