import { Injectable } from '@nestjs/common';
import { UsersUtil } from 'src/users/users.util';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersUtil {
  constructor(private readonly usersUtil: UsersUtil) {}

  parse(order: Order): Order {
    if (order.user) {
      order.user = this.usersUtil.parse(order.user);
    }

    if (order.orderItem) {
      let price: number | undefined = 0;

      let totalPrice = 0;

      for (const item of order.orderItem) {
        const { price: itemPrice, promotionPrice: itemPromotionPrice } = item;

        if (itemPrice === undefined) {
          price = undefined;

          break;
        }

        price += itemPrice;

        if (itemPromotionPrice !== undefined && itemPromotionPrice !== null) {
          totalPrice += itemPromotionPrice;
        } else {
          totalPrice += itemPrice;
        }

        if (price !== undefined) {
          order.price = price;

          order.totalPrice = totalPrice;

          order.savePrice = price - totalPrice;
        }
      }
    }

    return order;
  }

  parseMany(orders: Order[]): Order[] {
    return orders.map((item) => {
      return this.parse(item);
    });
  }
}
