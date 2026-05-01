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

  async findOne(productToken: string) {
    const product = await this.repo.findByToken(productToken);
    if (!product) throw new NotFoundException(`Product '${productToken}' not found`);
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const existing = await this.repo.findByToken(dto.productToken);
    if (existing) throw new ConflictException(`Product '${dto.productToken}' already exists`);
    return this.repo.create(dto);
  }

  async remove(productToken: string): Promise<void> {
    const product = await this.repo.findByToken(productToken);
    if (!product) throw new NotFoundException(`Product '${productToken}' not found`);
    await this.repo.deleteByToken(productToken);
  }

  async updateStock(productToken: string, dto: UpdateStockDto): Promise<Product> {
    const product = await this.repo.findByToken(productToken);
    if (!product) throw new NotFoundException(`Product '${productToken}' not found`);
    return this.repo.updateStock(productToken, dto.stock);
  }

  async replace(productToken: string, dto: ReplaceProductDto): Promise<Product> {
    const product = await this.repo.findByToken(productToken);
    if (!product) throw new NotFoundException(`Product '${productToken}' not found`);
    return this.repo.replace(productToken, dto);
  }
}
