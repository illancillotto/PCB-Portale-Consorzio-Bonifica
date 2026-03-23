import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createClient } from 'redis';

type RedisClient = ReturnType<typeof createClient>;

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: RedisClient | null = null;
  private connectPromise: Promise<RedisClient> | null = null;

  async ping() {
    try {
      const client = await this.getClient();
      const result = await client.ping();

      return {
        available: result === 'PONG',
        status: result,
      };
    } catch (error) {
      return {
        available: false,
        status: error instanceof Error ? error.message : 'Redis unavailable',
      };
    }
  }

  async setJson(key: string, value: Record<string, unknown>, ttlSeconds?: number) {
    const client = await this.getClient();
    const payload = JSON.stringify(value);

    if (ttlSeconds && ttlSeconds > 0) {
      await client.set(key, payload, {
        EX: ttlSeconds,
      });
      return;
    }

    await client.set(key, payload);
  }

  async setString(key: string, value: string, ttlSeconds?: number) {
    const client = await this.getClient();

    if (ttlSeconds && ttlSeconds > 0) {
      await client.set(key, value, {
        EX: ttlSeconds,
      });
      return;
    }

    await client.set(key, value);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const client = await this.getClient();
    const value = await client.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.connectPromise = null;
    }
  }

  private async getClient() {
    if (this.client?.isOpen) {
      return this.client;
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    const url =
      process.env.PCB_REDIS_URL ??
      `redis://${process.env.PCB_REDIS_HOST ?? 'localhost'}:${process.env.PCB_REDIS_PORT ?? '6379'}`;

    const client = createClient({
      url,
    });

    this.connectPromise = client.connect().then(() => {
      this.client = client;
      this.connectPromise = null;
      return client;
    });

    return this.connectPromise;
  }
}
