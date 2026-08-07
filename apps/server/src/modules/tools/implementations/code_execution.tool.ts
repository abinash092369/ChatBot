import { ITool, ToolParametersSchema, ToolResult } from '../tool.interface.js';

export class CodeExecutionTool implements ITool {
  public readonly name = 'code_execution';
  public readonly description = 'Execute JavaScript/TypeScript code safely in an isolated sandbox and return console outputs or result.';
  public readonly parameters: ToolParametersSchema = {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description: 'JavaScript code snippet to execute',
      },
    },
    required: ['code'],
  };

  public async execute(input: { code: string }): Promise<ToolResult> {
    try {
      const logs: string[] = [];
      const customConsole = {
        log: (...args: any[]) => logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
        error: (...args: any[]) => logs.push(`[ERROR] ${args.join(' ')}`),
        warn: (...args: any[]) => logs.push(`[WARN] ${args.join(' ')}`),
      };

      const fn = new Function('console', `"use strict"; ${input.code}`);
      const returnVal = fn(customConsole);

      return {
        success: true,
        result: {
          stdout: logs.join('\n'),
          returnValue: returnVal !== undefined ? String(returnVal) : null,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        result: null,
        error: `Runtime Exception: ${err.message}`,
      };
    }
  }
}
