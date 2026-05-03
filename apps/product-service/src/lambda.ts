import { FastifyAdapter } from '@nestjs/platform-fastify';
import { createApp } from './bootstrap';
import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context } from 'aws-lambda';

// aws-lambda-fastify only supports Fastify v4; we use Fastify's built-in inject()
// to process Lambda events natively without an external adapter.
let fastifyInstance: any;

async function bootstrap() {
  if (!fastifyInstance) {
    const nestApp = await createApp(new FastifyAdapter());
    await nestApp.init();
    fastifyInstance = nestApp.getHttpAdapter().getInstance();
    await fastifyInstance.ready();
  }
  return fastifyInstance;
}

export const lambdaHandler = async (
  event: APIGatewayProxyEventV2,
  _context: Context,
): Promise<APIGatewayProxyStructuredResultV2> => {
  const server = await bootstrap();

  const url = event.rawPath + (event.rawQueryString ? `?${event.rawQueryString}` : '');

  const response = await server.inject({
    method: event.requestContext.http.method,
    url,
    headers: event.headers,
    payload: event.body
      ? event.isBase64Encoded
        ? Buffer.from(event.body, 'base64').toString()
        : event.body
      : undefined,
  });

  return {
    statusCode: response.statusCode,
    headers: response.headers as Record<string, string>,
    body: response.body,
    isBase64Encoded: false,
  };
};
