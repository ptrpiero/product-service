import { Product } from './product.model';

export abstract class IProductsRepository {
  abstract findAll(page: number, limit: number): Promise<{ data: Product[]; total: number }>;
  abstract findById(id: number): Promise<Product | null>;
  abstract findByToken(productToken: string): Promise<Product | null>;
  abstract create(data: Omit<Product, 'id'>): Promise<Product>;
  abstract deleteById(id: number): Promise<void>;
  abstract updateStock(id: number, stock: number): Promise<Product>;
  abstract replace(id: number, data: Pick<Product, 'name' | 'price' | 'stock'>): Promise<Product>;
}
