import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../products.service';
import { IProductsRepository } from '../products.repository.interface';
import { Product } from '../product.model';

const mockProducts: Product[] = [
  { id: 1, productToken: 'tok-001', name: 'Widget A', price: 9.99, stock: 100 },
  { id: 2, productToken: 'tok-002', name: 'Gadget B', price: 24.99, stock: 50 },
];

const mockRepo: IProductsRepository = {
  findAll: jest.fn().mockResolvedValue({ data: mockProducts, total: 2 }),
  findById: jest.fn(),
  findByToken: jest.fn(),
  create: jest.fn(),
  deleteById: jest.fn(),
  updateStock: jest.fn(),
  replace: jest.fn(),
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: IProductsRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  it('calls repo.findAll with default page and limit', async () => {
    (mockRepo.findAll as jest.Mock).mockResolvedValueOnce({
      data: mockProducts,
      total: 2,
    });
    const result = await service.findAll();
    expect(jest.mocked(mockRepo.findAll)).toHaveBeenCalledWith(
      1,
      10,
      undefined,
      undefined,
      undefined,
    );
    expect(result).toEqual({ data: mockProducts, total: 2 });
  });

  it('forwards page and limit to repo', async () => {
    (mockRepo.findAll as jest.Mock).mockResolvedValueOnce({
      data: [],
      total: 0,
    });
    await service.findAll(2, 5);
    expect(jest.mocked(mockRepo.findAll)).toHaveBeenCalledWith(
      2,
      5,
      undefined,
      undefined,
      undefined,
    );
  });

  describe('findOne', () => {
    it('returns the product when found', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValueOnce(mockProducts[0]);
      const result = await service.findOne(1);
      expect(jest.mocked(mockRepo.findById)).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProducts[0]);
    });

    it('throws NotFoundException when product is not found', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const dto = {
      name: 'New',
      productToken: 'tok-new',
      price: 5.99,
      stock: 10,
    };
    const created: Product = { id: 6, ...dto };

    it('creates and returns the product when token is unused', async () => {
      (mockRepo.findByToken as jest.Mock).mockResolvedValueOnce(null);
      (mockRepo.create as jest.Mock).mockResolvedValueOnce(created);
      const result = await service.create(dto);
      expect(jest.mocked(mockRepo.findByToken)).toHaveBeenCalledWith(
        dto.productToken,
      );
      expect(jest.mocked(mockRepo.create)).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });

    it('throws ConflictException when product token already exists', async () => {
      (mockRepo.findByToken as jest.Mock).mockResolvedValueOnce(
        mockProducts[0],
      );
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(jest.mocked(mockRepo.create)).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes the product when it exists', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValueOnce(mockProducts[0]);
      (mockRepo.deleteById as jest.Mock).mockResolvedValueOnce(undefined);
      await service.remove(1);
      expect(jest.mocked(mockRepo.deleteById)).toHaveBeenCalledWith(1);
    });

    it('throws NotFoundException when product does not exist', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(jest.mocked(mockRepo.deleteById)).not.toHaveBeenCalled();
    });
  });

  describe('updateStock', () => {
    const updated: Product = { ...mockProducts[0], stock: 42 };

    it('returns the updated product when it exists', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValueOnce(mockProducts[0]);
      (mockRepo.updateStock as jest.Mock).mockResolvedValueOnce(updated);
      const result = await service.updateStock(1, { stock: 42 });
      expect(jest.mocked(mockRepo.updateStock)).toHaveBeenCalledWith(1, 42);
      expect(result).toEqual(updated);
    });

    it('throws NotFoundException when product does not exist', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.updateStock(999, { stock: 5 })).rejects.toThrow(
        NotFoundException,
      );
      expect(jest.mocked(mockRepo.updateStock)).not.toHaveBeenCalled();
    });
  });

  describe('replace', () => {
    const dto = { name: 'Updated Widget', price: 19.99, stock: 50 };
    const replaced: Product = { id: 1, productToken: 'tok-001', ...dto };

    it('returns the replaced product when it exists', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValueOnce(mockProducts[0]);
      (mockRepo.replace as jest.Mock).mockResolvedValueOnce(replaced);
      const result = await service.replace(1, dto);
      expect(jest.mocked(mockRepo.replace)).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(replaced);
    });

    it('throws NotFoundException when product does not exist', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.replace(999, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(jest.mocked(mockRepo.replace)).not.toHaveBeenCalled();
    });
  });
});
