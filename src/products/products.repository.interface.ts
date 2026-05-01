import { Product } from './product.model';

export abstract class IProductsRepository {
  abstract findAll(page: number, limit: number): Promise<{ data: Product[]; total: number }>;
  abstract findByToken(productToken: string): Promise<Product | null>;
  abstract create(data: Omit<Product, 'id'>): Promise<Product>;
  abstract deleteByToken(productToken: string): Promise<void>;
  abstract updateStock(productToken: string, stock: number): Promise<Product>;
  abstract replace(productToken: string, data: Pick<Product, 'name' | 'price' | 'stock'>): Promise<Product>;
}
