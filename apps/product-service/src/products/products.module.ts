import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { IProductsRepository } from './products.repository.interface';
import { ProductsRepository } from './products.repository';
import { ProductEntity } from './product.entity';

@Module({
  imports: [SequelizeModule.forFeature([ProductEntity])],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    { provide: IProductsRepository, useClass: ProductsRepository },
  ],
})
export class ProductsModule {}
