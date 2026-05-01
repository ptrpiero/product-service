import { IsString, IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';

export class ReplaceProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsNumber()
  @Min(0)
  stock!: number;
}
