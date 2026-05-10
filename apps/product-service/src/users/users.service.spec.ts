import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { IUsersRepository } from './users.repository.interface';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: IUsersRepository, useValue: {} }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
