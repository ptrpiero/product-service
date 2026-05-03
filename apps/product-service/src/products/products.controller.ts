import { Body, Controller, DefaultValuePipe, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { ReplaceProductDto } from './dto/replace-product.dto';
import { Product } from './product.model';

@ApiTags('products')
@ApiExtraModels(Product)
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products', description: 'Returns a paginated list of all products.' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Page number (1-based)' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Filter by name or productToken (case-insensitive contains)' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['name', 'productToken'], description: 'Column to sort by' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort direction' })
  @ApiOkResponse({
    description: 'Paginated product list',
    schema: {
      properties: {
        data: { type: 'array', items: { $ref: getSchemaPath(Product) } },
        total: { type: 'integer', example: 5 },
      },
    },
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.service.findAll(page, limit, search, sortBy, sortOrder);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, type: Product })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a product' })
  @ApiResponse({ status: 201, type: Product })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'productToken already exists' })
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Patch(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update stock', description: 'Partially updates only the stock field.' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, type: Product })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  updateStock(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStockDto) {
    return this.service.updateStock(id, dto);
  }

  @Put(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Replace a product', description: 'Replaces name, price and stock. productToken cannot be changed.' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, type: Product })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  replace(@Param('id', ParseIntPipe) id: number, @Body() dto: ReplaceProductDto) {
    return this.service.replace(id, dto);
  }
}
