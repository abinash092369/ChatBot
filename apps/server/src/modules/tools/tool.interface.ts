export interface ToolParameterProperty {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  enum?: string[];
}

export interface ToolParametersSchema {
  type: 'object';
  properties: Record<string, ToolParameterProperty>;
  required?: string[];
}

export interface ToolExecutionContext {
  userId: string;
  conversationId?: string;
  messageId?: string;
}

export interface ToolResult {
  success: boolean;
  result: any;
  error?: string;
  executionTimeMs?: number;
}

export interface ITool {
  readonly name: string;
  readonly description: string;
  readonly parameters: ToolParametersSchema;
  execute(input: any, context?: ToolExecutionContext): Promise<ToolResult>;
}
