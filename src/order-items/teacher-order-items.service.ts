import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { entityUtils } from 'src/commons/utils/entities.util';
import { courseEntityName } from 'src/courses/entities/course.entity';
import { orderEntityName } from 'src/orders/entities/order.entity';
import { userEntityName } from 'src/users/entities/user.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  TFindAllOrderItemsDto,
  TFindManyOrderItemsDto,
} from './dto/teacher-find-order-item.dto';
import { TFindRevenueDto } from './dto/teacher-find-revenue';
import { OrderItem, orderItemEntityName } from './entities/order-item.entity';
import moment from 'moment';
import _ from 'lodash';
import { DEFAULT_DATE_FORMAT, VN_DATE_FORMAT } from 'src/config';
import { TRevenue } from './teacher-order-items.type';
import { EOrderStatus } from 'src/orders/orders.enum';

@Injectable()
export class TeacherOrderItemsService {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async findMany(
    tFindManyOrderItemsDto: TFindManyOrderItemsDto,
    teacherId: number,
  ) {
    const { pageSize, currentPage, startDate, endDate, ...findDto } =
      tFindManyOrderItemsDto;

    const unformattedStartDate =
      startDate || moment().startOf('month').format(DEFAULT_DATE_FORMAT);

    const unformattedEndDate =
      endDate || moment().endOf('month').format(DEFAULT_DATE_FORMAT);

    const query = this.findAllQuery(
      {
        ...findDto,
        startDate: unformattedStartDate,
        endDate: unformattedEndDate,
      },
      teacherId,
    );

    const { take, skip } = entityUtils.getPagination({ pageSize, currentPage });

    const found = await query
      .addSelect([
        `${orderItemEntityName}.createdAt`,
        `${orderItemEntityName}.updatedAt`,
        `${orderItemEntityName}.price`,
        `${orderItemEntityName}.promotionPrice`,
        // order
        `${orderEntityName}.paymentMethod`,
        `${userEntityName}.id`,
        `${userEntityName}.fullname`,
        // course
        `${courseEntityName}.id`,
        `${courseEntityName}.name`,
      ])
      .take(take)
      .skip(skip)
      .getMany();

    return found;
  }

  async count(tFindAllOrderItemsDto: TFindAllOrderItemsDto, teacherId: number) {
    const query = this.findAllQuery(tFindAllOrderItemsDto, teacherId);

    const result = await query.getCount();

    return result;
  }

  async findRevenue(
    tFindRevenueDto: TFindRevenueDto,
    currentUserId: number,
  ): Promise<TRevenue> {
    const unformattedStartDate =
      tFindRevenueDto.startDate ||
      moment().startOf('month').format(DEFAULT_DATE_FORMAT);

    const unformattedEndDate =
      tFindRevenueDto.endDate ||
      moment().endOf('month').format(DEFAULT_DATE_FORMAT);

    const query = this.findAllQuery(
      { startDate: unformattedStartDate, endDate: unformattedEndDate },
      currentUserId,
    ).addSelect([
      `${orderItemEntityName}.price`,
      `${orderItemEntityName}.promotionPrice`,
    ]);

    const orderItems = await query.getMany();

    let revenue = 0;

    for (const orderItem of orderItems) {
      if (_.isNumber(orderItem.promotionPrice)) {
        revenue += orderItem.promotionPrice;
      } else {
        revenue += orderItem.price;
      }
    }

    const result = {
      revenue,
      countCourses: orderItems.length,
      startDate: moment(unformattedStartDate).format(VN_DATE_FORMAT),
      endDate: moment(unformattedEndDate).format(VN_DATE_FORMAT),
    };

    return result;
  }

  findQuery(teacherId: number): SelectQueryBuilder<OrderItem> {
    return this.orderItemRepository
      .createQueryBuilder(orderItemEntityName)
      .where(`${orderItemEntityName}.isActive = true`)
      .innerJoin(
        `${orderItemEntityName}.${courseEntityName}`,
        courseEntityName,
        `${courseEntityName}.userId = :teacherId`,
        { teacherId },
      )
      .innerJoin(
        `${orderItemEntityName}.${orderEntityName}`,
        orderEntityName,
        `${orderEntityName}.status = :orderStatus`,
        {
          orderStatus: EOrderStatus.Success,
        },
      )
      .innerJoin(`${orderEntityName}.${userEntityName}`, userEntityName)
      .select([`${orderItemEntityName}.id`]);
  }

  findAllQuery(
    findAllPurchaseDto: TFindAllOrderItemsDto,
    teacherId: number,
  ): SelectQueryBuilder<OrderItem> {
    const { startDate: fromDate, endDate: toDate } = findAllPurchaseDto;

    let query = this.findQuery(teacherId);

    if (fromDate && toDate) {
      const startDate = moment(fromDate)
        .startOf('day')
        .format('YYYY-MM-DD HH:mm:ss');

      const endDate = moment(toDate).endOf('day').format('YYYY-MM-DD HH:mm:ss');

      query = query.andWhere(
        `${orderEntityName}.statusChangeTime BETWEEN :startDate AND :endDate`,
        {
          startDate,
          endDate,
        },
      );
    }

    return query;
  }
}
