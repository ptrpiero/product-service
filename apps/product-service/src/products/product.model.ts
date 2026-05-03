import { ApiProperty } from '@nestjs/swagger';

export class Product {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'tok-001' })
  productToken!: string;

  @ApiProperty({ example: 'Widget A' })
  name!: string;

  @ApiProperty({ example: 9.99 })
  price!: number;

  @ApiProperty({ example: 100 })
  stock!: number;
}
