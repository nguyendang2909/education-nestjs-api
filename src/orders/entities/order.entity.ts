import { CommonEntity } from 'src/commons/entities';
import { entityUtils } from 'src/commons/utils/entities.util';
import { OrderItem } from 'src/order-items/entities/order-item.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { EOrderStatus, EPaymentMethod } from '../orders.enum';

@Entity()
export class Order extends CommonEntity {
  @Column({ type: 'enum', enum: EPaymentMethod, nullable: true })
  paymentMethod?: EPaymentMethod;

  @Column({ type: 'datetime', nullable: false })
  statusChangeTime: Date | string;

  @Column({
    type: 'enum',
    enum: EOrderStatus,
    default: EOrderStatus.WaitForPayment,
  })
  status: EOrderStatus;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn()
  user!: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  @JoinTable()
  orderItem: OrderItem[];

  price?: number;

  totalPrice?: number;

  savePrice?: number;

  constructor(init?: Partial<Order>) {
    super();

    Object.assign(this, init);
  }
}

export const orderEntityName = entityUtils.getEntityName(Order);
