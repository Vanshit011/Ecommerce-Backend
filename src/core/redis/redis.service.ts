import { Injectable, OnModuleInit } from '@nestjs/common';
import { redis } from './redis.client';

@Injectable()
export class RedisService implements OnModuleInit {
  async onModuleInit() {
    try {
      await redis.ping();
      // console.log('✅ Redis connected');
    } catch (error) {
      console.error('❌ Redis connection failed:', (error as Error).message);
    }
  }

  get(key: string) {
    return redis.get(key);
  }

  set(key: string, value: string, ttl?: number) {
    return ttl ? redis.set(key, value, 'EX', ttl) : redis.set(key, value);
  }

  del(key: string) {
    return redis.del(key);
  }
}
