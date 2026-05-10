import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDTO {
  @IsString()
  @IsNotEmpty()
  declare id: string;
  @IsString({
    message: 'Error message',
  })
  @IsNotEmpty()
  declare username: string;
}
