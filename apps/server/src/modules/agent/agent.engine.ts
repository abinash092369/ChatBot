import { toolRegistry } from '../tools/tool.registry.js';
import { ToolResult } from '../tools/tool.interface.js';

export interface AgentExecutionStep {
  toolName: string;
  input: any;
  output?: any;
  error?: string;
}

export class AgentEngine {
  public static async evaluateAndExecuteTools(
    prompt: string,
    context: { userId: string; conversationId?: string; messageId?: string },
  ): Promise<{ stepsExecuted: AgentExecutionStep[]; augmentedPrompt: string }> {
    const stepsExecuted: AgentExecutionStep[] = [];
    let augmentedPrompt = prompt;

    const lower = prompt.toLowerCase();

    // 1. Web Search Intent
    if (lower.includes('search') || lower.includes('news') || lower.includes('latest on') || lower.includes('weather')) {
      const searchResult = await toolRegistry.executeTool('web_search', { query: prompt }, context);
      stepsExecuted.push({
        toolName: 'web_search',
        input: { query: prompt },
        output: searchResult.result,
        error: searchResult.error,
      });

      if (searchResult.success && searchResult.result?.results) {
        const snippets = searchResult.result.results.map((r: any) => `- ${r.snippet} (${r.link})`).join('\n');
        augmentedPrompt += `\n\n[Live Web Search Context]:\n${snippets}`;
      }
    }

    // 2. Calculator Intent
    if (/\d+[\s]*[+\-*/^][\s]*\d+/.test(prompt) || lower.includes('calculate') || lower.includes('compute')) {
      const mathExpr = prompt.replace(/.*?((?:\d+[\s]*[+\-*/^][\s]*\d+)+).*/, '$1');
      if (mathExpr && mathExpr !== prompt) {
        const calcResult = await toolRegistry.executeTool('calculator', { expression: mathExpr }, context);
        stepsExecuted.push({
          toolName: 'calculator',
          input: { expression: mathExpr },
          output: calcResult.result,
          error: calcResult.error,
        });

        if (calcResult.success) {
          augmentedPrompt += `\n\n[Calculator Tool Result]: ${mathExpr} = ${calcResult.result.value}`;
        }
      }
    }

    // 3. Current Date / Time Intent
    if (lower.includes('current time') || lower.includes('what date') || lower.includes('today\'s date')) {
      const dateResult = await toolRegistry.executeTool('datetime', { action: 'current_time' }, context);
      stepsExecuted.push({
        toolName: 'datetime',
        input: { action: 'current_time' },
        output: dateResult.result,
      });

      if (dateResult.success) {
        augmentedPrompt += `\n\n[System Date/Time Context]: ${dateResult.result.formatted}`;
      }
    }

    // 4. Code Execution Intent
    if (lower.startsWith('run code') || lower.startsWith('execute js')) {
      const code = prompt.replace(/^(run code|execute js)\s*:?\s*/i, '');
      const codeResult = await toolRegistry.executeTool('code_execution', { code }, context);
      stepsExecuted.push({
        toolName: 'code_execution',
        input: { code },
        output: codeResult.result,
        error: codeResult.error,
      });

      if (codeResult.success) {
        augmentedPrompt += `\n\n[Code Execution Result]:\nstdout: ${codeResult.result.stdout}\nreturn: ${codeResult.result.returnValue}`;
      }
    }

    return { stepsExecuted, augmentedPrompt };
  }
}
