import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Widget A' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'tok-001' })
  @IsString()
  @IsNotEmpty()
  productToken!: string;

  @ApiProperty({ example: 9.99 })
  @IsNumber()
  @IsPositive()
  price!: number;

  @ApiProperty({ example: 100, minimum: 0 })
  @IsNumber()
  @Min(0)
  stock!: number;
}
