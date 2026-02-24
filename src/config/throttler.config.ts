import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const throttlerConfig: ThrottlerModuleOptions = [
  {
    ttl: 60000, // 60 seconds
    limit: 1000, // 1000 requests per TTL
  },
];
