import { Injectable, NotFoundException } from '@nestjs/common';
import { IProductsRepository } from './products.repository.interface';

@Injectable()
export class ProductsService {
  constructor(private readonly repo: IProductsRepository) {}

  findAll(page = 1, limit = 10) {
    return this.repo.findAll(page, limit);
  }

  async findOne(productToken: string) {
    const product = await this.repo.findByToken(productToken);
    if (!product) throw new NotFoundException(`Product '${productToken}' not found`);
    return product;
  }
}
