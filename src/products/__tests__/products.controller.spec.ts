import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '../products.controller';
import { ProductsService } from '../products.service';
import { Product } from '../product.model';

const mockProducts: Product[] = [
  { id: 1, productToken: 'tok-001', name: 'Widget A', price: 9.99, stock: 100 },
];

const mockService = {
  findAll: jest.fn().mockResolvedValue({ data: mockProducts, total: 1 }),
};

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockService }],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('returns paginated products with default params', async () => {
    const result = await controller.findAll(1, 10);
    expect(mockService.findAll).toHaveBeenCalledWith(1, 10);
    expect(result).toEqual({ data: mockProducts, total: 1 });
  });

  it('passes page and limit through to the service', async () => {
    await controller.findAll(3, 5);
    expect(mockService.findAll).toHaveBeenCalledWith(3, 5);
  });
});
