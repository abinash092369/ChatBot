import { IAIProvider } from './interfaces/ai-provider.interface.js';
import { GeminiProvider } from './providers/gemini.provider.js';

export class AIFactory {
  private static providers: Map<string, IAIProvider> = new Map();

  public static getProvider(providerName = 'gemini', apiKey?: string): IAIProvider {
    const key = `${providerName}_${apiKey || 'default'}`;
    if (!AIFactory.providers.has(key)) {
      switch (providerName.toLowerCase()) {
        case 'gemini':
        default:
          AIFactory.providers.set(key, new GeminiProvider(apiKey));
          break;
      }
    }
    return AIFactory.providers.get(key)!;
  }
}
