import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // 🚨 MUST be false for Stripe
  });

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://192.168.5.42:5173',
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS blocked'));
      }
    },
    credentials: true,
  });

  // RAW ONLY for webhook
  app.use('/webhook/stripe', bodyParser.raw({ type: 'application/json' }));

  // JSON for rest
  app.use(bodyParser.json());

  await app.listen(3000);
}
bootstrap();
