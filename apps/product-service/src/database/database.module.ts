import { Injectable, Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProductEntity } from '../products/product.entity';
import { UserEntity } from '../users/user.entity';

const SEED_DATA = [
  { productToken: 'tok-001', name: 'Widget A',          price: 9.99,  stock: 100 },
  { productToken: 'tok-002', name: 'Gadget B',          price: 24.99, stock: 50  },
  { productToken: 'tok-003', name: 'Doohickey C',       price: 4.49,  stock: 200 },
  { productToken: 'tok-004', name: 'Thingamajig D',     price: 49.99, stock: 15  },
  { productToken: 'tok-005', name: 'Whatchamacallit E', price: 14.99, stock: 75  },
];

const SEED_USERS = [{
        id: 'u1',
        username: 'pippo'
      }, {
        id: 'u2',
        username: 'pluto'
      }]

@Injectable()
class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectModel(ProductEntity)
    private readonly productModel: typeof ProductEntity,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const count = await this.productModel.count();
    if (count === 0) {
      await this.productModel.bulkCreate(SEED_DATA as any);
      this.logger.log(`Seeded ${SEED_DATA.length} products`);
    }
  }
}


@Injectable()
class UserSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectModel(UserEntity)
    private readonly userModel: typeof UserEntity
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const ucount = await this.userModel.count();
    if (ucount === 0) {
      await this.userModel.bulkCreate(SEED_USERS);
      this.logger.log(`Seeded ${SEED_USERS.length} users`);
    }
  }
}


@Module({
  imports: [SequelizeModule.forFeature([ProductEntity, UserEntity])],
  providers: [DatabaseSeederService, UserSeederService],
})
export class DatabaseModule {}
