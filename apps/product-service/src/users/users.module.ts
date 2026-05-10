import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserEntity } from './user.entity';
import { UsersRepository } from './user.repository';
import { IUsersRepository } from './users.repository.interface';

@Module({
  imports:[SequelizeModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [
    UsersService,
    {provide: IUsersRepository, useClass: UsersRepository}
  ],
})
export class UsersModule {}
