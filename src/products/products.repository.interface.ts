import { Product } from './product.model';

export abstract class IProductsRepository {
  abstract findAll(page: number, limit: number): Promise<{ data: Product[]; total: number }>;
  abstract findByToken(productToken: string): Promise<Product | null>;
}
