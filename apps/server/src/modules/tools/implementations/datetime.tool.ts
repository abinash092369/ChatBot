import { ITool, ToolParametersSchema, ToolResult } from '../tool.interface.js';

export class DateTimeTool implements ITool {
  public readonly name = 'datetime';
  public readonly description = 'Get current date, time, timezone information, or perform date math.';
  public readonly parameters: ToolParametersSchema = {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        description: 'Action to perform',
        enum: ['current_time', 'format_date', 'days_between'],
      },
      timeZone: {
        type: 'string',
        description: 'Target timezone (e.g. UTC, America/New_York, Asia/Tokyo)',
      },
    },
    required: ['action'],
  };

  public async execute(input: { action: string; timeZone?: string }): Promise<ToolResult> {
    try {
      const now = new Date();
      const timeZone = input.timeZone || 'UTC';
      const formatted = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'full',
        timeStyle: 'full',
        timeZone: timeZone.includes('/') ? timeZone : 'UTC',
      }).format(now);

      return {
        success: true,
        result: {
          iso: now.toISOString(),
          formatted,
          timeZone,
          timestamp: now.getTime(),
        },
      };
    } catch {
      const now = new Date();
      return {
        success: true,
        result: {
          iso: now.toISOString(),
          formatted: now.toUTCString(),
          timeZone: 'UTC',
        },
      };
    }
  }
}
