import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const throttlerConfig: ThrottlerModuleOptions =
  process.env.NODE_ENV === 'test'
    ? [{ ttl: 0, limit: 999999 }] // ← load testing: no throttle
    : [{ ttl: 60000, limit: 1000 }]; // ← production: 1000 req/60s
