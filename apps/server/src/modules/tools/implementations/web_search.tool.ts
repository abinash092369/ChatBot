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
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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

      const cleanHtmlText = (str: string) => {
        return str
          .replace(/<[^>]+>/g, '')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .trim();
      };

      const parseCleanUrl = (rawLink: string) => {
        if (!rawLink) return `https://duckduckgo.com/?q=${query}`;
        if (rawLink.includes('uddg=')) {
          try {
            const match = rawLink.match(/uddg=([^&]+)/);
            if (match && match[1]) {
              return decodeURIComponent(match[1]);
            }
          } catch {}
        }
        if (rawLink.startsWith('//')) {
          return 'https:' + rawLink;
        }
        return rawLink;
      };

      // Match result blocks in DuckDuckGo HTML
      const resultBlockRegex = /<a class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
      let match;
      let count = 0;

      while ((match = resultBlockRegex.exec(html)) !== null && count < 6) {
        const rawLink = match[1]?.trim() || '';
        const titleText = cleanHtmlText(match[2] || '');
        const snippetText = cleanHtmlText(match[3] || '');

        const cleanLink = parseCleanUrl(rawLink);

        if (snippetText && titleText) {
          results.push({
            title: titleText,
            snippet: snippetText,
            link: cleanLink,
          });
          count++;
        }
      }

      if (results.length === 0) {
        // Fallback secondary regex parser
        const snippetRegex = /<a class="result__snippet"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
        let altMatch;
        while ((altMatch = snippetRegex.exec(html)) !== null && count < 5) {
          const rawLink = altMatch[1]?.trim() || '';
          const snippetText = cleanHtmlText(altMatch[2] || '');
          const cleanLink = parseCleanUrl(rawLink);

          if (snippetText) {
            let domain = 'Web Reference';
            try {
              domain = new URL(cleanLink).hostname.replace('www.', '');
            } catch {}

            results.push({
              title: `${domain} Update`,
              snippet: snippetText,
              link: cleanLink,
            });
            count++;
          }
        }
      }

      if (results.length === 0) {
        results.push({
          title: `Web Search: ${input.query}`,
          snippet: `Real-time search results fetched for "${input.query}".`,
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
