export type RoleType = 'USER' | 'ASSISTANT' | 'SYSTEM' | 'TOOL' | 'DEVELOPER';

export type MessageStatus = 'PENDING' | 'STREAMING' | 'COMPLETED' | 'FAILED';

export interface Attachment {
  id: string;
  messageId?: string | null;
  conversationId: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  fileKey?: string | null;
  extractedText?: string | null;
  createdAt: string;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  reaction: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  parentId?: string | null;
  role: RoleType;
  content: string;
  model?: string | null;
  tokensUsed?: number | null;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  attachments?: Attachment[];
  reactions?: MessageReaction[];
}

export interface ConversationTag {
  id: string;
  userId: string;
  name: string;
  color?: string | null;
}

export interface ConversationFolder {
  id: string;
  userId: string;
  name: string;
  color?: string | null;
  icon?: string | null;
  createdAt: string;
  updatedAt: string;
  conversationsCount?: number;
}

export interface Conversation {
  id: string;
  userId: string;
  folderId?: string | null;
  folder?: ConversationFolder | null;
  title: string;
  isPinned: boolean;
  isArchived: boolean;
  isFavorite: boolean;
  model: string;
  systemPrompt?: string | null;
  settings?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  messages?: Message[];
  tags?: ConversationTag[];
}

export interface ConversationShare {
  id: string;
  conversationId: string;
  shareToken: string;
  isPublic: boolean;
  expiresAt?: string | null;
  createdAt: string;
}

export interface StreamChunk {
  deltaText: string;
  isDone: boolean;
  tokensUsed?: number;
  error?: string;
}

export interface AIProviderConfig {
  providerName: 'gemini' | 'openai' | 'claude' | 'groq' | 'deepseek' | 'ollama' | 'openrouter';
  apiKey?: string;
  defaultModel: string;
  temperature?: number;
  maxTokens?: number;
}
