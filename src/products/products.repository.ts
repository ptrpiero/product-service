import { Injectable } from '@nestjs/common';
import { Product } from './product.model';
import { IProductsRepository } from './products.repository.interface';

@Injectable()
export class ProductsRepository implements IProductsRepository {
  private readonly products: Product[] = [
    { id: 1, productToken: 'tok-001', name: 'Widget A', price: 9.99, stock: 100 },
    { id: 2, productToken: 'tok-002', name: 'Gadget B', price: 24.99, stock: 50 },
    { id: 3, productToken: 'tok-003', name: 'Doohickey C', price: 4.49, stock: 200 },
    { id: 4, productToken: 'tok-004', name: 'Thingamajig D', price: 49.99, stock: 15 },
    { id: 5, productToken: 'tok-005', name: 'Whatchamacallit E', price: 14.99, stock: 75 },
  ];

  async findAll(page: number, limit: number): Promise<{ data: Product[]; total: number }> {
    const start = (page - 1) * limit;
    return {
      data: this.products.slice(start, start + limit),
      total: this.products.length,
    };
  }
}
