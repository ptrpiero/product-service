import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { IProductsRepository } from './products.repository.interface';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { ReplaceProductDto } from './dto/replace-product.dto';
import { Product } from './product.model';

@Injectable()
export class ProductsService {
  constructor(private readonly repo: IProductsRepository) {}

  findAll(page = 1, limit = 10) {
    return this.repo.findAll(page, limit);
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.repo.findById(id);
    if (!product) throw new NotFoundException(`Product #${id} not found`);
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const existing = await this.repo.findByToken(dto.productToken);
    if (existing) throw new ConflictException(`Product '${dto.productToken}' already exists`);
    return this.repo.create(dto);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repo.deleteById(id);
  }

  async updateStock(id: number, dto: UpdateStockDto): Promise<Product> {
    await this.findOne(id);
    return this.repo.updateStock(id, dto.stock);
  }

  async replace(id: number, dto: ReplaceProductDto): Promise<Product> {
    await this.findOne(id);
    return this.repo.replace(id, dto);
  }
}
