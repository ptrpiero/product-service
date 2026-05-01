import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { IProductsRepository } from './products.repository.interface';
import { ProductsRepository } from './products.repository';

@Module({
  controllers: [ProductsController],
  providers: [
    ProductsService,
    { provide: IProductsRepository, useClass: ProductsRepository },
  ],
})
export class ProductsModule {}
