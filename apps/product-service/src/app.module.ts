import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { DatabaseModule } from './database/database.module';
import { ProductEntity } from './products/product.entity';
import { UsersModule } from './users/users.module';
import { UserEntity } from './users/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        let username = config.get<string>('DB_USER', 'app');
        let password = config.get<string>('DB_PASSWORD', 'secret');

        const secretArn = config.get<string>('DB_SECRET_ARN');
        if (secretArn) {
          const client = new SecretsManagerClient({
            region: process.env.AWS_REGION ?? 'eu-west-1',
          });
          const { SecretString } = await client.send(
            new GetSecretValueCommand({ SecretId: secretArn }),
          );
          const secret = JSON.parse(SecretString!);
          username = secret.username;
          password = secret.password;
        }

        return {
          dialect: 'mysql' as const,
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 3306),
          username,
          password,
          database: config.get<string>('DB_NAME', 'ecommerce'),
          models: [ProductEntity, UserEntity],
          synchronize: true,
          autoLoadModels: true,
          logging: false,
          pool: { min: 0, max: 2 },
        };
      },
    }),
    ProductsModule,
    UsersModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
