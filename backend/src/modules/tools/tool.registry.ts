import { ITool, ToolExecutionContext, ToolResult } from './tool.interface.js';
import { prisma } from '../../database/prisma.service.js';

export class ToolRegistry {
  private static instance: ToolRegistry;
  private tools: Map<string, ITool> = new Map();

  public static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry();
    }
    return ToolRegistry.instance;
  }

  public registerTool(tool: ITool): void {
    this.tools.set(tool.name, tool);
  }

  public getTool(name: string): ITool | undefined {
    return this.tools.get(name);
  }

  public getAllTools(): ITool[] {
    return Array.from(this.tools.values());
  }

  public getToolsJsonSchema() {
    return this.getAllTools().map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    }));
  }

  public async executeTool(name: string, input: any, context?: ToolExecutionContext): Promise<ToolResult> {
    const startTime = Date.now();
    const tool = this.tools.get(name);

    if (!tool) {
      return {
        success: false,
        result: null,
        error: `Tool '${name}' not found in system registry`,
        executionTimeMs: 0,
      };
    }

    try {
      const result = await tool.execute(input, context);
      const durationMs = Date.now() - startTime;
      result.executionTimeMs = durationMs;

      // Log execution to DB
      await prisma.toolExecution.create({
        data: {
          conversationId: context?.conversationId,
          messageId: context?.messageId,
          toolName: name,
          input: input || {},
          output: result.result ? JSON.parse(JSON.stringify(result.result)) : undefined,
          status: result.success ? 'SUCCESS' : 'FAILED',
          durationMs,
          error: result.error,
        },
      });

      return result;
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      const errorMsg = err.message || 'Tool execution failed';

      await prisma.toolExecution.create({
        data: {
          conversationId: context?.conversationId,
          messageId: context?.messageId,
          toolName: name,
          input: input || {},
          status: 'FAILED',
          durationMs,
          error: errorMsg,
        },
      });

      return {
        success: false,
        result: null,
        error: errorMsg,
        executionTimeMs: durationMs,
      };
    }
  }
}

export const toolRegistry = ToolRegistry.getInstance();
