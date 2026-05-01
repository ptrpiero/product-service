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

  async findByToken(productToken: string): Promise<Product | null> {
    return this.products.find((p) => p.productToken === productToken) ?? null;
  }

  async create(data: Omit<Product, 'id'>): Promise<Product> {
    const product: Product = { id: this.products.length + 1, ...data };
    this.products.push(product);
    return product;
  }

  async deleteByToken(productToken: string): Promise<void> {
    const idx = this.products.findIndex((p) => p.productToken === productToken);
    if (idx !== -1) this.products.splice(idx, 1);
  }

  async updateStock(productToken: string, stock: number): Promise<Product> {
    const product = this.products.find((p) => p.productToken === productToken)!;
    product.stock = stock;
    return product;
  }

  async replace(productToken: string, data: Pick<Product, 'name' | 'price' | 'stock'>): Promise<Product> {
    const product = this.products.find((p) => p.productToken === productToken)!;
    product.name = data.name;
    product.price = data.price;
    product.stock = data.stock;
    return product;
  }
}
