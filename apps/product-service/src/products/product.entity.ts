import {
  AutoIncrement,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

@Table({ tableName: 'products', timestamps: false })
export class ProductEntity extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Unique
  @Column(DataType.STRING)
  declare productToken: string;

  @Column(DataType.STRING)
  declare name: string;

  @Column(DataType.DECIMAL(10, 2))
  declare price: number;

  @Column(DataType.INTEGER)
  declare stock: number;
}
