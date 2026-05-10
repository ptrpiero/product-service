import { FastifyAdapter } from '@nestjs/platform-fastify';
import { createApp } from './bootstrap';

async function bootstrap() {
  const app = await createApp(new FastifyAdapter({ logger: true }));
  await app.listen(parseInt(process.env.PORT ?? '3000'), '0.0.0.0');
}
void bootstrap();
