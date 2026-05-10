import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { IUsersRepository } from './users.repository.interface';
import { CreateUserDTO } from './dto/create-user.dto';
import { User } from './user.model';

@Injectable()
export class UsersService {
  constructor(private readonly repo: IUsersRepository) {}

  findAll(page = 1, limit = 10, search?: string, sortBy?: string, sortOrder?: 'ASC' | 'DESC') {
    return this.repo.findAll(page, limit, search, sortBy, sortOrder);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  async create(dto: CreateUserDTO): Promise<User> {
    const existing = await this.repo.findById(dto.id);
    if (existing) throw new ConflictException(`User '${dto.id}' already exists`);
    return this.repo.create(dto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.deleteById(id);
  }

  async replace(id: string, dto: CreateUserDTO): Promise<User> {
    await this.findOne(id);
    return this.repo.replace(id, dto);
  }
}
