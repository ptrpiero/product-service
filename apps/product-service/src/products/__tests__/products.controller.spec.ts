import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '../products.controller';
import { ProductsService } from '../products.service';
import { Product } from '../product.model';

const mockProducts: Product[] = [
  { id: 1, productToken: 'tok-001', name: 'Widget A', price: 9.99, stock: 100 },
];

const mockService = {
  findAll: jest.fn().mockResolvedValue({ data: mockProducts, total: 1 }),
  findOne: jest.fn(),
  create: jest.fn(),
  remove: jest.fn(),
  updateStock: jest.fn(),
  replace: jest.fn(),
};

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockService }],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    jest.clearAllMocks();
  });

  it('returns paginated products with default params', async () => {
    mockService.findAll.mockResolvedValueOnce({ data: mockProducts, total: 1 });
    const result = await controller.findAll(1, 10);
    expect(mockService.findAll).toHaveBeenCalledWith(1, 10, undefined, undefined, undefined);
    expect(result).toEqual({ data: mockProducts, total: 1 });
  });

  it('passes page and limit through to the service', async () => {
    mockService.findAll.mockResolvedValueOnce({ data: [], total: 0 });
    await controller.findAll(3, 5);
    expect(mockService.findAll).toHaveBeenCalledWith(3, 5, undefined, undefined, undefined);
  });

  describe('findOne', () => {
    it('returns the product for a given id', async () => {
      mockService.findOne.mockResolvedValueOnce(mockProducts[0]);
      const result = await controller.findOne(1);
      expect(mockService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProducts[0]);
    });
  });

  describe('create', () => {
    it('delegates to service and returns the created product', async () => {
      const dto = { name: 'New', productToken: 'tok-new', price: 5.99, stock: 10 };
      const created: Product = { id: 6, ...dto };
      mockService.create.mockResolvedValueOnce(created);
      const result = await controller.create(dto);
      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('remove', () => {
    it('delegates to service', async () => {
      mockService.remove.mockResolvedValueOnce(undefined);
      await controller.remove(1);
      expect(mockService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('updateStock', () => {
    it('delegates to service and returns the updated product', async () => {
      const dto = { stock: 42 };
      const updated: Product = { ...mockProducts[0], stock: 42 };
      mockService.updateStock.mockResolvedValueOnce(updated);
      const result = await controller.updateStock(1, dto);
      expect(mockService.updateStock).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updated);
    });
  });

  describe('replace', () => {
    it('delegates to service and returns the replaced product', async () => {
      const dto = { name: 'Updated Widget', price: 19.99, stock: 50 };
      const replaced: Product = { id: 1, productToken: 'tok-001', ...dto };
      mockService.replace.mockResolvedValueOnce(replaced);
      const result = await controller.replace(1, dto);
      expect(mockService.replace).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(replaced);
    });
  });
});
