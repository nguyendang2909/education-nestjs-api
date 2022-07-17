import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment from 'moment';
import { Messages, messagesService } from 'src/commons/messages';
import { handleUpdateOne } from 'src/commons/record-handlers';
import { DB_TIME_FORMAT } from 'src/config';
import { orderItemEntityName } from 'src/order-items/entities/order-item.entity';
import { Order, orderEntityName } from 'src/orders/entities/order.entity';
import { EOrderStatus, EPaymentMethod } from 'src/orders/orders.enum';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  findOneOrderQueryById({ id }: { id: number }, currentUserId?: number) {
    let query = this.ordersRepository
      .createQueryBuilder(orderEntityName)
      .where(`${orderEntityName}.isActive = true`)
      .andWhere(`${orderEntityName}.id = :id`, { id })
      .innerJoin(
        `${orderEntityName}.${orderItemEntityName}`,
        orderItemEntityName,
        `${orderItemEntityName}.isActive = true`,
      )
      .select(`${orderEntityName}.id`);

    if (currentUserId) {
      query = query.andWhere(`${orderEntityName}.userId = :currentUserId`, {
        currentUserId,
      });
    }

    return query;
  }

  async pay(orderId: number, paymentMethod: EPaymentMethod) {
    const order = await this.findOneOrderQueryById({
      id: orderId,
    }).getOne();

    if (!order) {
      throw new NotFoundException();
    }

    const paid = await this.ordersRepository.update(
      { id: orderId },
      {
        paymentMethod,
        status: EOrderStatus.Success,
        statusChangeTime: moment().format(DB_TIME_FORMAT),
      },
    );

    handleUpdateOne(paid, Messages.order.payment);
  }

  getPrice(order: Order) {
    const { orderItem: orderItems } = order;

    if (!orderItems || !orderItems.length) {
      throw new NotFoundException(
        messagesService.setNotFound(
          `${Messages.course.name} trong ${Messages.order.name}`,
        ),
      );
    }

    let totalPrice = 0;

    let price = 0;

    for (
      let i = 0, orderItemsLength = orderItems.length;
      i < orderItemsLength;
      i += 1
    ) {
      const orderItem = orderItems[i];

      if (!orderItem.price) {
        throw new BadRequestException(
          messagesService.setNotFound(
            `${Messages.course.name} trong ${Messages.order.name}`,
          ),
        );
      }

      price += orderItem.price || 0;

      totalPrice +=
        orderItem.promotionPrice === null ||
        orderItem.promotionPrice === undefined
          ? price
          : orderItem.promotionPrice;
    }

    const savePrice = price - totalPrice;

    return { totalPrice, price, savePrice };
  }
}
