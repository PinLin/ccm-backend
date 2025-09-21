import { RedisService } from '@liaoliaots/nestjs-redis';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EventAdapter } from './feature/event/event.adapter';
import * as ConnectRedis from 'connect-redis';
import * as ExpressSession from 'express-session';
import { ConfigService } from '@nestjs/config';
import { urlencoded, json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const redis = app.get(RedisService);
  const RedisStore = ConnectRedis(ExpressSession);
  const expressSession = ExpressSession({
    store: new RedisStore({ client: redis.getClient() }),
    secret: config.get('SESSION_SECRET'),
    resave: false,
    saveUninitialized: false,
  });
  app.use(expressSession);
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.useWebSocketAdapter(new EventAdapter(app, expressSession));

  app.enableCors({ credentials: true, origin: 'http://localhost:8080' });

  await app.listen(3000);
}
bootstrap();
