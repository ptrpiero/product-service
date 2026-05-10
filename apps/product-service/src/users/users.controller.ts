import {
  Body,
  Controller,
  Get,
  HttpCode,
  Injectable,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/create-user.dto';

@Injectable()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private readonly logger = new Logger(UsersController.name);

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  async createUser(@Body() createUserDto: CreateUserDTO) {
    this.logger.log(createUserDto, 'Creating user');
    return await this.usersService.create(createUserDto);
  }
}
