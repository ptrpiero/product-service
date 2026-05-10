import { FastifyAdapter } from '@nestjs/platform-fastify';
import { createApp } from './bootstrap';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';

// aws-lambda-fastify only supports Fastify v4; we use Fastify's built-in inject()
// to process Lambda events natively without an external adapter.
interface InjectableServer {
  ready(): Promise<void>;
  inject(opts: {
    method: string;
    url: string;
    headers?: Record<string, string | undefined>;
    payload?: string;
  }): Promise<{
    statusCode: number;
    headers: Record<string, string | string[] | undefined>;
    body: string;
  }>;
}

let fastifyInstance: InjectableServer | undefined;

async function bootstrap(): Promise<InjectableServer> {
  if (!fastifyInstance) {
    const nestApp = await createApp(new FastifyAdapter());
    await nestApp.init();
    fastifyInstance = nestApp
      .getHttpAdapter()
      .getInstance() as InjectableServer;
    await fastifyInstance.ready();
  }
  return fastifyInstance;
}

export const lambdaHandler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> => {
  const server = await bootstrap();

  const url =
    event.rawPath + (event.rawQueryString ? `?${event.rawQueryString}` : '');

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
