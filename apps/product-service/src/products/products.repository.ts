import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Product } from './product.model';
import { ProductEntity } from './product.entity';
import { IProductsRepository } from './products.repository.interface';

@Injectable()
export class ProductsRepository implements IProductsRepository {
  constructor(
    @InjectModel(ProductEntity)
    private readonly model: typeof ProductEntity,
  ) {}

  private static readonly SORTABLE = ['name', 'productToken'] as const;

  async findAll(
    page: number,
    limit: number,
    search?: string,
    sortBy?: string,
    sortOrder: 'ASC' | 'DESC' = 'ASC',
  ): Promise<{ data: Product[]; total: number }> {
    const col = ProductsRepository.SORTABLE.includes(sortBy as any) ? sortBy! : 'id';
    const where = search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { productToken: { [Op.like]: `%${search}%` } },
          ],
        }
      : undefined;

    const { rows, count } = await this.model.findAndCountAll({
      limit,
      offset: (page - 1) * limit,
      order: [[col, sortOrder]],
      where,
    });
    return { data: rows.map((r) => this.toPlain(r)), total: count };
  }

  async findById(id: number): Promise<Product | null> {
    const row = await this.model.findByPk(id);
    return row ? this.toPlain(row) : null;
  }

  async findByToken(productToken: string): Promise<Product | null> {
    const row = await this.model.findOne({ where: { productToken } });
    return row ? this.toPlain(row) : null;
  }

  async create(data: Omit<Product, 'id'>): Promise<Product> {
    const row = await this.model.create(data as any);
    return this.toPlain(row);
  }

  async deleteById(id: number): Promise<void> {
    await this.model.destroy({ where: { id } });
  }

  async updateStock(id: number, stock: number): Promise<Product> {
    await this.model.update({ stock }, { where: { id } });
    return this.toPlain((await this.model.findByPk(id))!);
  }

  async replace(id: number, data: Pick<Product, 'name' | 'price' | 'stock'>): Promise<Product> {
    await this.model.update(data, { where: { id } });
    return this.toPlain((await this.model.findByPk(id))!);
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
