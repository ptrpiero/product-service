import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Min,
} from 'class-validator';

export class ReplaceProductDto {
  @ApiProperty({ example: 'Widget A v2' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 14.99 })
  @IsNumber()
  @IsPositive()
  price!: number;

  @ApiProperty({ example: 80, minimum: 0 })
  @IsNumber()
  @Min(0)
  stock!: number;
}
