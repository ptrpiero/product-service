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
  });

  it('calls repo.findAll with default page and limit', async () => {
    const result = await service.findAll();
    expect(mockRepo.findAll).toHaveBeenCalledWith(1, 10);
    expect(result).toEqual({ data: mockProducts, total: 2 });
  });

  it('forwards page and limit to repo', async () => {
    await service.findAll(2, 5);
    expect(mockRepo.findAll).toHaveBeenCalledWith(2, 5);
  });
});
