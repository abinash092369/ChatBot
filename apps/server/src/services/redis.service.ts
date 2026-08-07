import { Redis } from 'ioredis';
import { env } from '../config/env.config.js';

class RedisService {
  private client: Redis | null = null;
  private memoryStore: Map<string, { value: string; expiresAt?: number }> = new Map();
  private isConnected = false;

  constructor() {
    try {
      const redisUrl =
        env.REDIS_URL ||
        (env.REDIS_PASSWORD
          ? `redis://default:${env.REDIS_PASSWORD}@${env.REDIS_HOST}:${env.REDIS_PORT}`
          : `redis://${env.REDIS_HOST}:${env.REDIS_PORT}`);
      this.client = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // Don't crash if redis server is offline during dev
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        console.log('✅ Redis client connected');
      });

      this.client.on('error', (err) => {
        if (this.isConnected) {
          console.warn('⚠️ Redis connection lost, falling back to memory store:', err.message);
        }
        this.isConnected = false;
      });

      this.client.connect().catch(() => {
        this.isConnected = false;
        console.warn('⚠️ Redis server unreachable. Using memory cache fallback.');
      });
    } catch {
      this.isConnected = false;
    }
  }

  public async get(key: string): Promise<string | null> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.get(key);
      } catch {
        // Fallback
      }
    }
    const item = this.memoryStore.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }
    return item.value;
  }

  public async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch {
        // Fallback
      }
    }
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.memoryStore.set(key, { value, expiresAt });
  }

  public async del(key: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
        return;
      } catch {
        // Fallback
      }
    }
    this.memoryStore.delete(key);
  }
}

export const redisService = new RedisService();
