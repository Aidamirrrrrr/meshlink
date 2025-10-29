import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { type EnvironmentVariables } from './config/env.validation';

async function bootstrap() {
    const logger = new Logger(bootstrap.name);
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService<EnvironmentVariables>);

    const port = configService.getOrThrow<number>('PORT');
    const corsRaw = configService.getOrThrow<string>('CORS_ORIGIN').trim();
    const corsOrigins =
        corsRaw === '*'
            ? '*'
            : corsRaw
                  .split(',')
                  .map((origin) => origin.trim())
                  .filter(Boolean);

    app.enableCors({
        origin: corsOrigins,
        credentials: true,
    });

    app.enableShutdownHooks();

    await app.listen(port);

    logger.log(`WebRTC Signaling Server running on: http://localhost:${port}`);
    logger.log(`WebSocket endpoint: ws://localhost:${port}`);
}
void bootstrap();
