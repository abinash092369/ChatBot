import { ITool, ToolParametersSchema, ToolResult } from '../tool.interface.js';

export class CalculatorTool implements ITool {
  public readonly name = 'calculator';
  public readonly description = 'Perform mathematical calculations and evaluate math expressions.';
  public readonly parameters: ToolParametersSchema = {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: 'Mathematical expression to evaluate, e.g. "120 * 0.15" or "sqrt(144) + 12"',
      },
    },
    required: ['expression'],
  };

  public async execute(input: { expression: string }): Promise<ToolResult> {
    try {
      const sanitized = input.expression.replace(/[^0-9+\-*/().^sqrtMathabs\s]/g, '');
      const evaluated = Function(`"use strict"; return (${sanitized.replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)')})`)();

      return {
        success: true,
        result: {
          expression: input.expression,
          value: evaluated,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        result: null,
        error: `Math evaluation error: ${err.message}`,
      };
    }
  }
}
