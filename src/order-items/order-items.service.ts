import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course, courseEntityName } from 'src/courses/entities/course.entity';
import { Order, orderEntityName } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateOrderItem } from './dto/create-order-item.dto';
import {
  FindAllOrderItemsDto,
  FindOneOrderItemConditions,
} from './dto/find-order-item.dto';
import { OrderItem, orderItemEntityName } from './entities/order-item.entity';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async createMany(createManyOrderItemsDto: CreateOrderItem[]) {
    const createOptions: Partial<OrderItem>[] = createManyOrderItemsDto.map(
      (createPurchaseDto) => {
        const { courseId, orderId, userId, ...createDto } = createPurchaseDto;

        return {
          ...createDto,
          createdBy: userId,
          updatedBy: userId,
          course: new Course({
            id: courseId,
          }),
          order: new Order({
            id: orderId,
          }),
          user: new User({ id: userId }),
        };
      },
    );

    return await this.orderItemRepository.save(createOptions);
    // const { orderId, purchases } = createPurchaseDto;
    // const order = new Order({ id: orderId, isActive: true });
    // const createOptions: Partial<Purchase>[] = purchases.map((purchase) => {
    //   return new Purchase({
    //     price: purchase.price,
    //     promotionPrice: purchase.promotionPrice,
    //     course: new Course({
    //       id: purchase.courseId,
    //     }),
    //     user: new User({
    //       id: currentUserId,
    //     }),
    //     order,
    //   });
    // });
    // return await this.purchaseRepository.save(createOptions);
  }

  // update(id: number, updatePurchaseDto: UpdatePurchaseDto) {
  //   return `This action updates a #${id} purchase`;
  // }

  remove(id: number) {
    return `This action removes a #${id} purchase`;
  }

  findQuery(): SelectQueryBuilder<OrderItem> {
    return this.orderItemRepository
      .createQueryBuilder(orderItemEntityName)
      .where(`${orderItemEntityName}.isActive = true`)
      .innerJoin(
        `${orderItemEntityName}.${courseEntityName}`,
        courseEntityName,
        `${courseEntityName}.isActive = true`,
      )
      .innerJoin(
        `${orderItemEntityName}.${orderEntityName}`,
        orderEntityName,
        `${orderEntityName}.isActive = true`,
      )
      .addSelect([`${orderItemEntityName}.id`]);
  }

  findOneQuery(
    findOnePurchaseConditions: FindOneOrderItemConditions,
  ): SelectQueryBuilder<OrderItem> {
    const { id, courseId, userId, orderStatus } = findOnePurchaseConditions;

    let query = this.findQuery();

    if (id) {
      query = query.andWhere(`${orderItemEntityName}.id = :id`, { id });

      return query;
    }

    if (courseId && userId) {
      query = query
        .andWhere(`${orderItemEntityName}.courseId = :courseId`, {
          courseId,
        })
        .andWhere(`${orderEntityName}.userId = :userId`, { userId });

      if (orderStatus) {
        query = query.andWhere(`${orderEntityName}.status = :orderStatus`, {
          orderStatus: orderStatus,
        });
      }

      return query;
    }

    throw new BadRequestException('Lỗi truy vấn lượt mua hàng');
  }

  findAllQuery(
    findAllOrderItemsDto: FindAllOrderItemsDto,
  ): SelectQueryBuilder<OrderItem> {
    const { courseId, orderId, userId, orderStatus } = findAllOrderItemsDto;

    let query = this.findQuery();

    if (courseId) {
      query = query.andWhere(`${orderItemEntityName}.courseId = :courseId`, {
        courseId,
      });
    }

    if (orderId) {
      query = query.andWhere(`${orderItemEntityName}.orderId = :orderId`, {
        orderId,
      });
    }

    if (userId) {
      query = query.andWhere(`${orderItemEntityName}.userId = :userId`, {
        userId,
      });
    }

    if (orderStatus) {
      query = query.andWhere(`${orderItemEntityName}.status = :orderStatus`, {
        orderStatus: orderStatus,
      });
    }

    return query;
  }
}
