import { ITool, ToolParametersSchema, ToolResult } from '../tool.interface.js';
import crypto from 'crypto';

export class TextUtilitiesTool implements ITool {
  public readonly name = 'text_utilities';
  public readonly description = 'Perform text operations: base64 encode/decode, generate UUID, format JSON/SQL, or convert text.';
  public readonly parameters: ToolParametersSchema = {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        description: 'Operation type',
        enum: ['generate_uuid', 'base64_encode', 'base64_decode', 'format_json'],
      },
      text: {
        type: 'string',
        description: 'Input text for the operation',
      },
    },
    required: ['operation'],
  };

  public async execute(input: { operation: string; text?: string }): Promise<ToolResult> {
    try {
      const text = input.text || '';
      let output = '';

      switch (input.operation) {
        case 'generate_uuid':
          output = crypto.randomUUID();
          break;
        case 'base64_encode':
          output = Buffer.from(text, 'utf-8').toString('base64');
          break;
        case 'base64_decode':
          output = Buffer.from(text, 'base64').toString('utf-8');
          break;
        case 'format_json':
          output = JSON.stringify(JSON.parse(text), null, 2);
          break;
        default:
          output = text;
      }

      return {
        success: true,
        result: {
          operation: input.operation,
          output,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        result: null,
        error: `Text operation failed: ${err.message}`,
      };
    }
  }
}
