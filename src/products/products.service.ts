import { Injectable } from '@nestjs/common';
import { IProductsRepository } from './products.repository.interface';

@Injectable()
export class ProductsService {
  constructor(private readonly repo: IProductsRepository) {}

  findAll(page = 1, limit = 10) {
    return this.repo.findAll(page, limit);
  }
}
