import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { type CreationAttributes, Op } from 'sequelize';
import { User } from './user.model';
import { UserEntity } from './user.entity';
import { IUsersRepository } from './users.repository.interface';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(
    @InjectModel(UserEntity)
    private readonly model: typeof UserEntity,
  ) {}

  private static readonly SORTABLE = ['username'] as const;

  async findAll(
    page: number,
    limit: number,
    search?: string,
    sortBy?: string,
    sortOrder: 'ASC' | 'DESC' = 'ASC',
  ): Promise<{ data: User[]; total: number }> {
    const col = UsersRepository.SORTABLE.includes(
      sortBy as (typeof UsersRepository.SORTABLE)[number],
    )
      ? sortBy!
      : 'id';
    const where = search
      ? {
          username: { [Op.like]: `%${search}%` },
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

  async findById(id: string): Promise<User | null> {
    const row = await this.model.findByPk(id);
    return row ? this.toPlain(row) : null;
  }

  async create(data: Omit<User, 'id'>): Promise<User> {
    const row = await this.model.create(data as CreationAttributes<UserEntity>);
    return this.toPlain(row);
  }

  async deleteById(id: string): Promise<void> {
    await this.model.destroy({ where: { id } });
  }

  async replace(id: string, data: Pick<User, 'username'>): Promise<User> {
    await this.model.update(data, { where: { id } });
    return this.toPlain((await this.model.findByPk(id))!);
  }

  private toPlain(row: UserEntity): User {
    const p = row.get({ plain: true }) as UserEntity;
    return {
      id: p.id,
      username: p.username,
    };
  }
}
