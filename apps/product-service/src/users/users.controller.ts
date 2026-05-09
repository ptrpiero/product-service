import { Body, Controller, Get, HttpCode, Injectable, Logger, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/create-user.dto';

type User = {
  id: String
  username: String
}

const users: User[] = [{
  id: 'u1',
  username: 'Tom'
}, {
  id: 'u2',
  username: 'Sam'
}]

@Injectable()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {
  }

  private readonly logger = new Logger(UsersController.name)

  @Get()
  findAll() {
    return users
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return users.find(u => u.id === id) || null
  }

  @Post()
  @HttpCode(201)
  createUser(@Body() createUserDto: CreateUserDTO) {
    this.logger.log(createUserDto, 'Creating user');
    users.push(createUserDto)
  }
}
