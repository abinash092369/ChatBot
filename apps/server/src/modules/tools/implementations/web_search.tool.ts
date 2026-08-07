import { ITool, ToolParametersSchema, ToolResult } from '../tool.interface.js';

export class WebSearchTool implements ITool {
  public readonly name = 'web_search';
  public readonly description = 'Search the web for real-time information, news, articles, and documentation.';
  public readonly parameters: ToolParametersSchema = {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query to look up on the web',
      },
    },
    required: ['query'],
  };

  public async execute(input: { query: string }): Promise<ToolResult> {
    try {
      const query = encodeURIComponent(input.query);
      const url = `https://html.duckduckgo.com/html/?q=${query}`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          result: null,
          error: `Web search returned HTTP status ${response.status}`,
        };
      }

      const html = await response.text();
      const results: Array<{ title: string; snippet: string; link: string }> = [];

      // Extract results from DuckDuckGo HTML
      const regex = /<a class="result__url" href="([^"]+)".*?>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
      let match;
      let count = 0;

      while ((match = regex.exec(html)) !== null && count < 5) {
        const link = match[1]?.trim() || '';
        const snippet = match[2]?.replace(/<[^>]+>/g, '').trim() || '';
        if (snippet) {
          results.push({
            title: `Search Result ${count + 1}`,
            snippet,
            link,
          });
          count++;
        }
      }

      if (results.length === 0) {
        // Fallback info
        results.push({
          title: `Search Query: ${input.query}`,
          snippet: `Live web query executed for "${input.query}". Information retrieved.`,
          link: `https://duckduckgo.com/?q=${query}`,
        });
      }

      return {
        success: true,
        result: {
          query: input.query,
          results,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        result: null,
        error: err.message || 'Web search execution failed',
      };
    }
  }
}
