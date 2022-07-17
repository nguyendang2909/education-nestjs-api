import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment from 'moment';
import { AdminCartsService } from 'src/carts/admin-carts.service';
import { EBooleanString } from 'src/commons/enums';
import { Messages, messagesService } from 'src/commons/messages';
import { handleUpdateOne } from 'src/commons/record-handlers';
import { entityUtils } from 'src/commons/utils/entities.util';
import { DB_TIME_FORMAT } from 'src/config';
import { courseEntityName } from 'src/courses/entities/course.entity';
import { orderItemEntityName } from 'src/order-items/entities/order-item.entity';
import { userEntityName } from 'src/users/entities/user.entity';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import {
  AFindAllOrdersDto,
  AFindManyOrdersDto,
  AFindOneOrderConditions,
} from './dto/admin-find-orders.dto';
import { AUpdateOrderDto } from './dto/admin-update-order.dto';
import { Order, orderEntityName } from './entities/order.entity';
import { OrdersUtil } from './orders.util';

@Injectable()
export class AdminOrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly adminCartsService: AdminCartsService,
    private readonly ordersUtil: OrdersUtil,
  ) {}

  async findMany(aFindManyOrdersDto: AFindManyOrdersDto) {
    const { currentPage, pageSize, sortCreatedAt, ...findDto } =
      aFindManyOrdersDto;

    let query = this.findAllQuery(findDto);

    const { take, skip } = entityUtils.getPagination({ currentPage, pageSize });

    if (sortCreatedAt) {
      query = query.addOrderBy(`${orderEntityName}.createdAt`, sortCreatedAt);
    }

    const orders = await query.take(take).skip(skip).getMany();

    const parsedOrders = this.ordersUtil.parseMany(orders);

    return parsedOrders;
  }

  async count(aFindAllOrdersDto: AFindAllOrdersDto) {
    const { ...findDto } = aFindAllOrdersDto;

    const query = this.findAllQuery(findDto);

    const order = await query.getCount();

    return order;
  }

  async findOneOrFailById(id: number) {
    const order = await this.findOneQuery({ id }).getOne();

    if (!order) {
      throw new NotFoundException(
        messagesService.setNotFound(Messages.order.name),
      );
    }

    const parsedOrder = this.ordersUtil.parse(order);

    return parsedOrder;
  }

  async update(id: number, aUpdateOrderDto: AUpdateOrderDto) {
    const { status, ...updateDto } = aUpdateOrderDto;

    const order = await this.findOneQuery({ id }).getOne();

    if (!order) {
      throw new NotFoundException(
        messagesService.setNotFound(Messages.order.name),
      );
    }

    const findConditions = new Order({
      id,
    });

    const updateOptions: Partial<Order> = {
      ...updateDto,
    };

    if (status) {
      updateOptions.status = status;

      updateOptions.statusChangeTime = moment().format(DB_TIME_FORMAT);
    }

    const updated = await this.orderRepository.update(
      findConditions,
      updateOptions,
    );

    return handleUpdateOne(updated, Messages.order.name);
  }

  findQuery(): SelectQueryBuilder<Order> {
    return this.orderRepository
      .createQueryBuilder(orderEntityName)
      .leftJoinAndSelect(
        `${orderEntityName}.${orderItemEntityName}`,
        orderItemEntityName,
        `${orderItemEntityName}.isActive = true`,
      )
      .leftJoinAndSelect(
        `${orderItemEntityName}.${courseEntityName}`,
        courseEntityName,
        `${courseEntityName}.isActive = true`,
      )
      .innerJoinAndSelect(
        `${orderEntityName}.${userEntityName}`,
        userEntityName,
      );
  }

  findAllQuery(aFindAllOrdersDto: AFindAllOrdersDto) {
    const { id, isActive, paymentMethod, status } = aFindAllOrdersDto;

    let query = this.findQuery();

    if (isActive) {
      query = query.andWhere(`${orderEntityName}.isActive = :isActive`, {
        isActive: isActive === EBooleanString.True ? true : false,
      });
    }

    if (id) {
      if (Array.isArray(id)) {
        query = query.andWhere(
          new Brackets((qb) => {
            qb.where(`${orderEntityName}.id = :idFirstItem`, {
              idFirstItem: +id[0],
            });

            for (let i = 1, idLength = id.length; i < idLength; i += 1) {
              qb.orWhere(`${orderEntityName}.id LIKE :id${i}`, {
                [`id${i}`]: `%${+id[i]}%`,
              });
            }
          }),
        );
      } else {
        query = query.andWhere(`${orderEntityName}.id LIKE :id`, {
          id: `%${+id}%`,
        });
      }
    }

    if (paymentMethod) {
      query = query.where(`${orderEntityName}.paymentMethod = :paymentMethod`, {
        paymentMethod,
      });
    }

    if (status) {
      query = query.where(`${orderEntityName}.status = :status`, {
        status,
      });
    }

    return query;
  }

  findOneQuery(aFindOneOrderConditions: AFindOneOrderConditions) {
    const { id } = aFindOneOrderConditions;

    const query = this.findQuery().andWhere(`${orderEntityName}.id = :id`, {
      id,
    });

    return query;
  }
}
