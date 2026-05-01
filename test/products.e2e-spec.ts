import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { HttpLoggingInterceptor } from '../src/common/interceptors/http-logging.interceptor';

describe('Products (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.useGlobalInterceptors(new HttpLoggingInterceptor());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  // ── GET /products ────────────────────────────────────────────

  describe('GET /products', () => {
    it('returns paginated list with defaults', () => {
      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect(({ body }) => {
          expect(body.total).toBe(5);
          expect(body.data).toHaveLength(5);
        });
    });

    it('respects page and limit query params', () => {
      return request(app.getHttpServer())
        .get('/products?page=2&limit=2')
        .expect(200)
        .expect(({ body }) => {
          expect(body.total).toBe(5);
          expect(body.data).toHaveLength(2);
          expect(body.data[0].productToken).toBe('tok-003');
        });
    });
  });

  // ── GET /products/:productToken ──────────────────────────────

  describe('GET /products/:productToken', () => {
    it('returns the product when found', () => {
      return request(app.getHttpServer())
        .get('/products/tok-001')
        .expect(200)
        .expect(({ body }) => {
          expect(body.productToken).toBe('tok-001');
          expect(body.name).toBe('Widget A');
        });
    });

    it('returns 404 for unknown token', () => {
      return request(app.getHttpServer())
        .get('/products/tok-999')
        .expect(404);
    });
  });

  // ── POST /products ───────────────────────────────────────────

  describe('POST /products', () => {
    it('creates and returns a product with 201', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({ name: 'New Thing', productToken: 'tok-new', price: 12.99, stock: 30 })
        .expect(201)
        .expect(({ body }) => {
          expect(body.productToken).toBe('tok-new');
          expect(body.name).toBe('New Thing');
          expect(body.price).toBe(12.99);
          expect(body.stock).toBe(30);
        });
    });

    it('returns 409 when productToken already exists', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Dupe', productToken: 'tok-001', price: 1.0, stock: 1 })
        .expect(409);
    });

    it('returns 400 when required fields are missing', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Incomplete' })
        .expect(400);
    });

    it('returns 400 when field types are wrong', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Bad', productToken: 'tok-x', price: 'free', stock: -5 })
        .expect(400);
    });
  });

  // ── PATCH /products/:productToken ────────────────────────────

  describe('PATCH /products/:productToken', () => {
    it('updates stock and returns the product', () => {
      return request(app.getHttpServer())
        .patch('/products/tok-001')
        .send({ stock: 42 })
        .expect(200)
        .expect(({ body }) => {
          expect(body.productToken).toBe('tok-001');
          expect(body.stock).toBe(42);
        });
    });

    it('returns 404 for unknown token', () => {
      return request(app.getHttpServer())
        .patch('/products/tok-999')
        .send({ stock: 5 })
        .expect(404);
    });

    it('returns 400 for negative stock', () => {
      return request(app.getHttpServer())
        .patch('/products/tok-001')
        .send({ stock: -1 })
        .expect(400);
    });
  });

  // ── PUT /products/:productToken ──────────────────────────────

  describe('PUT /products/:productToken', () => {
    it('replaces name, price and stock and returns the product', () => {
      return request(app.getHttpServer())
        .put('/products/tok-001')
        .send({ name: 'Widget A v2', price: 14.99, stock: 80 })
        .expect(200)
        .expect(({ body }) => {
          expect(body.productToken).toBe('tok-001');
          expect(body.name).toBe('Widget A v2');
          expect(body.price).toBe(14.99);
          expect(body.stock).toBe(80);
        });
    });

    it('returns 404 for unknown token', () => {
      return request(app.getHttpServer())
        .put('/products/tok-999')
        .send({ name: 'Ghost', price: 1.0, stock: 0 })
        .expect(404);
    });

    it('returns 400 when name is missing', () => {
      return request(app.getHttpServer())
        .put('/products/tok-001')
        .send({ price: 9.99, stock: 10 })
        .expect(400);
    });
  });

  // ── DELETE /products/:productToken ───────────────────────────

  describe('DELETE /products/:productToken', () => {
    it('returns 200 when product exists', () => {
      return request(app.getHttpServer())
        .delete('/products/tok-001')
        .expect(200);
    });

    it('returns 404 for unknown token', () => {
      return request(app.getHttpServer())
        .delete('/products/tok-999')
        .expect(404);
    });

    it('returns 404 on a second delete of the same token', async () => {
      await request(app.getHttpServer()).delete('/products/tok-002').expect(200);
      await request(app.getHttpServer()).delete('/products/tok-002').expect(404);
    });
  });
});
