import { User } from './user.model';

export abstract class IUsersRepository {
  abstract findAll(
    page: number,
    limit: number,
    search?: string,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
  ): Promise<{ data: User[]; total: number }>;
  abstract findById(id: string): Promise<User | null>;
  abstract create(data: Omit<User, 'id'>): Promise<User>;
  abstract deleteById(id: string): Promise<void>;
  abstract replace(id: string, data: Pick<User, 'username'>): Promise<User>;
}
