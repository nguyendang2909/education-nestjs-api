import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment from 'moment';
import { CartsService } from 'src/carts/carts.service';
import { Cart } from 'src/carts/entities/cart.entity';
import { Messages, messagesService } from 'src/commons/messages';
import { handleUpdateOne } from 'src/commons/record-handlers';
import { entityUtils } from 'src/commons/utils/entities.util';
import { DB_TIME_FORMAT } from 'src/config';
import { CoursesService } from 'src/courses/courses.service';
import { Course, courseEntityName } from 'src/courses/entities/course.entity';
import {
  OrderItem,
  orderItemEntityName,
} from 'src/order-items/entities/order-item.entity';
import { OrderItemsService } from 'src/order-items/order-items.service';
import { User } from 'src/users/entities/user.entity';
import { Brackets, getManager, Repository, SelectQueryBuilder } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  FindAllOrdersDto,
  FindManyOrdersDto,
  FindOneOrderConditions,
} from './dto/find-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, orderEntityName } from './entities/order.entity';
import { EOrderStatus } from './orders.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly cartsService: CartsService,
    private readonly orderItemsService: OrderItemsService,
    private readonly coursesService: CoursesService,
  ) {}

  public async create(createOrderDto: CreateOrderDto, currentUserId: number) {
    const { cartId, ...createDto } = createOrderDto;

    const carts = await this.cartsService
      .findAllQuery(
        {
          id: Array.isArray(cartId)
            ? cartId.map((item) => item.toString())
            : cartId.toString(),
        },
        currentUserId,
      )
      .addSelect([
        `${courseEntityName}.id`,
        `${courseEntityName}.price`,
        `${courseEntityName}.promotionPrice`,
      ])
      .getMany();

    if (carts.length === 0) {
      throw new BadRequestException('Đơn hàng không có khoá học');
    }

    const order = await getManager().transaction(
      async (transactionalEntityManager) => {
        const createdOrder = await transactionalEntityManager.save(
          new Order({
            ...createDto,
            user: new User({
              id: currentUserId,
            }),
            statusChangeTime: moment().format(DB_TIME_FORMAT),
          }),
        );

        await transactionalEntityManager.save(
          carts.map((cart) => {
            return new OrderItem({
              course: new Course({
                id: cart.course.id,
              }),
              order: new Order({
                id: createdOrder.id,
              }),
              price: cart.course.price,
              promotionPrice: cart.course.promotionPrice,
              createdBy: currentUserId,
              updatedBy: currentUserId,
            });
          }),
        );

        await transactionalEntityManager
          .createQueryBuilder()
          .update(Cart)
          .set({ isActive: false })
          .whereInIds(
            carts.map((cart) => {
              return cart.id;
            }),
          )
          .execute();

        return createdOrder;
      },
    );

    return order;
  }

  async findMany(findManyOrdersDto: FindManyOrdersDto, currentUserId: number) {
    const { currentPage, pageSize, ...findDto } = findManyOrdersDto;

    const query = this.findAllQuery(findDto, currentUserId);

    const { take, skip } = entityUtils.getPagination({ currentPage, pageSize });

    // console.log(take);

    const order = await query
      .addOrderBy(`${orderEntityName}.statusChangeTime`, `DESC`)
      .addSelect([
        // order
        `${orderEntityName}.createdAt`,
        `${orderEntityName}.paymentMethod`,
        `${orderEntityName}.statusChangeTime`,
        `${orderEntityName}.status`,
        // orderitem
        `${orderItemEntityName}.id`,
        `${orderItemEntityName}.price`,
        `${orderItemEntityName}.promotionPrice`,
        // course
        `${courseEntityName}.id`,
        `${courseEntityName}.name`,
        `${courseEntityName}.coverImageURL`,
      ])
      .take(take)
      .skip(skip)
      .getMany();

    return order;
  }

  async count(findAllOrdersDto: FindAllOrdersDto, currentUserId: number) {
    const { ...findDto } = findAllOrdersDto;

    const query = this.findAllQuery(findDto, currentUserId);

    const order = await query.getCount();

    return order;
  }

  async findOneOrFailById(id: number, currentUserId: number) {
    const order = await this.findOneQuery({ id }, currentUserId)
      .addSelect([
        // order
        `${orderEntityName}.paymentMethod`,
        `${orderEntityName}.statusChangeTime`,
        `${orderEntityName}.status`,
        // order item
        `${orderItemEntityName}.id`,
        `${orderItemEntityName}.price`,
        `${orderItemEntityName}.promotionPrice`,
        `${courseEntityName}.id`,
        `${courseEntityName}.price`,
        `${courseEntityName}.promotionPrice`,
        `${courseEntityName}.name`,
        `${courseEntityName}.coverImageURL`,
      ])
      .getOne();

    if (!order) {
      throw new NotFoundException(
        messagesService.setNotFound(Messages.order.name),
      );
    }

    const { orderItem: orderItems } = order;

    let totalPrice = 0;

    let price = 0;

    for (
      let i = 0, orderItemsLength = orderItems.length;
      i < orderItemsLength;
      i += 1
    ) {
      const orderItem = orderItems[i];

      price += orderItem.price || 0;

      totalPrice +=
        orderItem.promotionPrice === null ||
        orderItem.promotionPrice === undefined
          ? price
          : orderItem.promotionPrice;
    }

    const savePrice = price - totalPrice;

    return { ...order, price, totalPrice, savePrice };
  }

  async update(
    id: number,
    updateOrderDto: UpdateOrderDto,
    currentUserId: number,
  ) {
    const { paymentMethod, status } = updateOrderDto;

    const currentOrder = await this.findOneQuery({ id }, currentUserId)
      .addSelect([
        `${orderEntityName}.paymentMethod`,
        `${orderEntityName}.statusChangeTime`,
        `${orderEntityName}.status`,
      ])
      .getOne();

    if (!currentOrder) {
      throw new NotFoundException(
        messagesService.setNotFound(Messages.order.name),
      );
    }

    const updateOptions: Partial<Order> = {};

    if (paymentMethod) {
      if (currentOrder.status === EOrderStatus.WaitForPayment) {
        updateOptions.paymentMethod = paymentMethod;
      }
    }

    if (status) {
      if (
        ![EOrderStatus.Success, EOrderStatus.Cancel].includes(
          currentOrder.status,
        )
      ) {
        updateOptions.status = status;
      }
    }

    const updated = await this.orderRepository.update(
      { id, isActive: true },
      updateOptions,
    );

    return handleUpdateOne(updated, Messages.order.name);
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  findQuery(currentUserId: number): SelectQueryBuilder<Order> {
    return this.orderRepository
      .createQueryBuilder(orderEntityName)
      .where(`${orderEntityName}.isActive = true`)
      .andWhere(`${orderEntityName}.userId = :currentUserId`, {
        currentUserId,
      })
      .innerJoin(
        `${orderEntityName}.${orderItemEntityName}`,
        orderItemEntityName,
        `${orderItemEntityName}.isActive = true`,
      )
      .innerJoin(`${orderItemEntityName}.${courseEntityName}`, courseEntityName)
      .select(`${orderEntityName}.id`);
  }

  findAllQuery(findAllOrdersDto: FindAllOrdersDto, currentUserId: number) {
    const { id, status } = findAllOrdersDto;

    let query = this.findQuery(currentUserId);

    if (id) {
      if (Array.isArray(id)) {
        query = query.andWhere(
          new Brackets((qb) => {
            qb.where(`${orderEntityName}.id = :idFirstItem`, {
              idFirstItem: +id[0],
            });

            for (let i = 1, idLength = id.length; i < idLength; i += 1) {
              qb.orWhere(`${orderEntityName}.id = :id${i}`, {
                [`id${i}`]: +id[i],
              });
            }
          }),
        );
      } else {
        query = query.andWhere(`${orderEntityName}.id = :id`, {
          id,
        });
      }
    }

    if (status) {
      query = query.andWhere(`${orderEntityName}.status = :status`, {
        status,
      });
    }

    return query;
  }

  findOneQuery(
    findOneOrderConditions: FindOneOrderConditions,
    currentUserId: number,
  ) {
    const { id } = findOneOrderConditions;

    const query = this.findQuery(currentUserId).andWhere(
      `${orderEntityName}.id = :id`,
      {
        id,
      },
    );

    return query;
  }
}
