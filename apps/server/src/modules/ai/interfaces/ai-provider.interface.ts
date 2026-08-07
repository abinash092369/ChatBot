export interface MessageContentPart {
  mimeType?: string;
  dataBase64?: string;
  text?: string;
}

export interface ProviderMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  attachments?: MessageContentPart[];
}

export interface GenerateOptions {
  model: string;
  messages: ProviderMessage[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface StreamChunkResult {
  deltaText: string;
  isDone: boolean;
  tokensUsed?: number;
  finishReason?: string;
  error?: string;
}

export interface IAIProvider {
  readonly providerName: string;
  generateResponse(options: GenerateOptions): Promise<{ text: string; tokensUsed: number }>;
  generateStream(options: GenerateOptions): AsyncIterable<StreamChunkResult>;
  countTokens(text: string): Promise<number>;
}
