import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

@Table({ tableName: 'users', timestamps: false })
export class UserEntity extends Model {
  @PrimaryKey
  @Column(DataType.STRING)
  declare id: string;

  @Unique
  @Column(DataType.STRING)
  declare username: string;
}
