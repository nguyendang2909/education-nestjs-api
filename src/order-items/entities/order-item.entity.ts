import { CommonEntity } from 'src/commons/entities';
import { entityUtils } from 'src/commons/utils/entities.util';
import { Course } from 'src/courses/entities/course.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class OrderItem extends CommonEntity {
  @Column({ type: 'integer', nullable: false, default: 0 })
  price!: number;

  @Column({ type: 'integer', nullable: true })
  promotionPrice?: number;

  @ManyToOne(() => Order, { nullable: false })
  order!: Order;

  @ManyToOne(() => Course, { nullable: false })
  course!: Course;

  constructor(init?: Partial<OrderItem>) {
    super();

    Object.assign(this, init);
  }
}

export const orderItemEntityName = entityUtils.getEntityName(OrderItem);
