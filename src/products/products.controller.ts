import { Body, Controller, DefaultValuePipe, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { ReplaceProductDto } from './dto/replace-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.service.findAll(page, limit);
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.service.findOne(uuid);
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Delete(':productToken')
  @HttpCode(200)
  remove(@Param('productToken') productToken: string) {
    return this.service.remove(productToken);
  }

  @Patch(':productToken')
  @HttpCode(200)
  updateStock(@Param('productToken') productToken: string, @Body() dto: UpdateStockDto) {
    return this.service.updateStock(productToken, dto);
  }

  @Put(':productToken')
  @HttpCode(200)
  replace(@Param('productToken') productToken: string, @Body() dto: ReplaceProductDto) {
    return this.service.replace(productToken, dto);
  }
}
