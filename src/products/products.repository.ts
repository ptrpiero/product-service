import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from './product.model';
import { ProductEntity } from './product.entity';
import { IProductsRepository } from './products.repository.interface';

@Injectable()
export class ProductsRepository implements IProductsRepository {
  constructor(
    @InjectModel(ProductEntity)
    private readonly model: typeof ProductEntity,
  ) {}

  async findAll(page: number, limit: number): Promise<{ data: Product[]; total: number }> {
    const { rows, count } = await this.model.findAndCountAll({
      limit,
      offset: (page - 1) * limit,
      order: [['id', 'ASC']],
    });
    return { data: rows.map((r) => this.toPlain(r)), total: count };
  }

  async findByToken(productToken: string): Promise<Product | null> {
    const row = await this.model.findOne({ where: { productToken } });
    return row ? this.toPlain(row) : null;
  }

  async create(data: Omit<Product, 'id'>): Promise<Product> {
    const row = await this.model.create(data as any);
    return this.toPlain(row);
  }

  async deleteByToken(productToken: string): Promise<void> {
    await this.model.destroy({ where: { productToken } });
  }

  async updateStock(productToken: string, stock: number): Promise<Product> {
    await this.model.update({ stock }, { where: { productToken } });
    return this.toPlain((await this.model.findOne({ where: { productToken } }))!);
  }

  async replace(productToken: string, data: Pick<Product, 'name' | 'price' | 'stock'>): Promise<Product> {
    await this.model.update(data, { where: { productToken } });
    return this.toPlain((await this.model.findOne({ where: { productToken } }))!);
  }

  private toPlain(row: ProductEntity): Product {
    const p = row.get({ plain: true }) as any;
    return {
      id: p.id,
      productToken: p.productToken,
      name: p.name,
      price: parseFloat(p.price),
      stock: p.stock,
    };
  }
}
