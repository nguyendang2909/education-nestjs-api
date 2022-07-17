import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { handleDeleteOne, handleFindOne } from 'src/commons/record-handlers';
import { UserWithoutPassword } from 'src/users/users.type';
import { CreateCartDto } from './dto/create-cart.dto';
import {
  FindAllCartsDto,
  FindManyCartsDto,
  FindOneCartConditions,
  FindOneCartDto,
} from './dto/find-cart.dto';
import { Cart, cartEntityName } from './entities/cart.entity';
import { Brackets, FindConditions, getManager, Repository } from 'typeorm';
import { Course, courseEntityName } from 'src/courses/entities/course.entity';
import { User } from 'src/users/entities/user.entity';
import { CartPrice } from './carts.type';

import { Messages, messagesService } from 'src/commons/messages';
import { entityUtils } from 'src/commons/utils/entities.util';
import { InjectRepository } from '@nestjs/typeorm';
import { CoursesService } from 'src/courses/courses.service';
import {
  OrderItem,
  orderItemEntityName,
} from 'src/order-items/entities/order-item.entity';
import { OrderItemsService } from 'src/order-items/order-items.service';
import { Order } from 'src/orders/entities/order.entity';
import { EOrderStatus, EPaymentMethod } from 'src/orders/orders.enum';
import moment from 'moment';
import { DB_TIME_FORMAT } from 'src/config';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    @Inject(forwardRef(() => CoursesService))
    private readonly coursesService: CoursesService,
    private readonly orderItemsService: OrderItemsService,
  ) {}

  async create(createCartDto: CreateCartDto, currentUserId: number) {
    const { courseId, ...createDto } = createCartDto;

    // Tim khoa hoc
    const findCourse = await this.coursesService
      .findOneQuery({
        id: courseId,
      })
      .addSelect([
        `${courseEntityName}.price`,
        `${courseEntityName}.promotionPrice`,
        `${orderItemEntityName}.id`,
      ])
      .getOne();

    if (!findCourse) {
      throw new NotFoundException(
        messagesService.setNotFound(Messages.course.name),
      );
    }

    const orderItem = await this.orderItemsService
      .findOneQuery({
        orderStatus: EOrderStatus.Success,
        courseId: findCourse.id,
        userId: currentUserId,
      })
      .getOne();

    if (orderItem) {
      throw new BadRequestException('Bạn đã mua khoá học này');
    }

    const { price, promotionPrice } = findCourse;

    const freeCourse = price === 0 || promotionPrice === 0;

    const course = new Course({
      id: courseId,
    });

    const user = new User({
      id: currentUserId,
    });

    const findCart = await this.findOneQuery({ courseId }, currentUserId)
      .addSelect([`${cartEntityName}.isActive`])
      .getOne();

    if (freeCourse) {
      await getManager().transaction(async (transactionalEntityManager) => {
        const createdOrder = await transactionalEntityManager.save(
          new Order({
            paymentMethod: EPaymentMethod.Direct,
            user,
            status: EOrderStatus.Success,
            statusChangeTime: moment().format(DB_TIME_FORMAT),
            createdBy: currentUserId,
            updatedBy: currentUserId,
          }),
        );

        await transactionalEntityManager.save(
          new OrderItem({
            order: new Order({
              id: createdOrder.id,
            }),
            course,
            price: price,
            promotionPrice: promotionPrice,
            createdBy: currentUserId,
            updatedBy: currentUserId,
          }),
        );

        if (findCart) {
          await transactionalEntityManager.update(
            Cart,
            { id: findCart.id },
            {
              isActive: false,
            },
          );
        }
      });

      return {
        message: 'Đăng ký khoá học thành công',
      };
    }

    if (findCart) {
      if (findCart.isActive === false) {
        this.cartRepository.update(
          { id: findCart.id },
          {
            isActive: true,
          },
        );
      }

      return findCart;
    }

    const createOptions = new Cart({
      course: new Course({ id: courseId, isActive: true }),
      user: new User({ isActive: true, id: currentUserId }),
      ...createDto,
    });

    return await this.cartRepository.save(createOptions);
  }

  async findMany(findManyCartsDto: FindManyCartsDto, currentUserId: number) {
    const { pageSize, currentPage, ...findDto } = findManyCartsDto;

    const { take, skip } = entityUtils.getPagination({
      pageSize,
      currentPage,
    });

    const query = this.findAllQuery(findDto, currentUserId)
      .addSelect([
        `${courseEntityName}.id`,
        `${courseEntityName}.name`,
        `${courseEntityName}.price`,
        `${courseEntityName}.promotionPrice`,
        `${courseEntityName}.coverImageURL`,
      ])
      .take(take)
      .skip(skip);

    const cartItems = await query.getMany();

    return cartItems;

    // const cartItemsLength = cartItems.length;

    // let price = 0;

    // let promotionPrice = 0;

    // for (let i = 0; i < cartItemsLength; i += 1) {
    //   const cartItem = cartItems[i];

    //   const { price: coursePrice, promotionPrice: coursePromotionPrice } =
    //     cartItem.course;

    //   if (coursePrice) {
    //     price += coursePrice;
    //   }

    //   if (coursePromotionPrice) {
    //     promotionPrice += coursePromotionPrice;
    //   } else {
    //     if (coursePrice) {
    //       promotionPrice += coursePrice;
    //     }
    //   }
    // }

    // return { data: cartItems, price, promotionPrice };
  }

  async count(findAllCartsDto: FindAllCartsDto, currentUserId: number) {
    const count = await this.findAllQuery(
      findAllCartsDto,
      currentUserId,
    ).getCount();

    return count;
  }

  async findOne(findOneCartConditions: FindOneCartConditions, userId: number) {
    const query = this.findOneQuery(findOneCartConditions, userId);

    const found = await query.getOne();

    return found;
  }

  async findOneOrFail(
    findOneCartConditions: FindOneCartConditions,
    userId: number,
  ) {
    const found = await this.findOne(findOneCartConditions, userId);

    return handleFindOne(found);
  }

  async findOneById(
    id: number,
    findOneCartDto: FindOneCartDto,
    userId: number,
  ) {
    const query = this.findOneQuery({ ...findOneCartDto, id }, userId);

    const found = query.getOne();

    return found;
  }

  async findOneOrFailById(
    id: number,
    findOneCartDto: FindOneCartDto,
    userId: number,
  ) {
    const found = await this.findOneById(id, findOneCartDto, userId);

    return handleFindOne(found);
  }

  async findCartPrice(
    findAllCartsDto: FindAllCartsDto,
    currentUserId: number,
  ): Promise<CartPrice> {
    const query = this.findAllQuery({ ...findAllCartsDto }, currentUserId);

    const cartItems = await query
      .addSelect([
        `${courseEntityName}.id`,
        `${courseEntityName}.price`,
        `${courseEntityName}.promotionPrice`,
      ])
      .getMany();

    let totalPrice = 0;

    let price = 0;

    for (const cartItem of cartItems) {
      price += cartItem.course.price || 0;

      totalPrice +=
        cartItem.course.promotionPrice === null ||
        cartItem.course.promotionPrice === undefined
          ? price
          : cartItem.course.promotionPrice;
    }

    const savePrice = price - totalPrice;

    return { price, totalPrice, savePrice };
  }

  // update(id: number, updateCartDto: UpdateCartDto) {
  //   return `This action updates a #${id} cart`;
  // }

  async remove(id: number, user: UserWithoutPassword) {
    const currentUser = new User();

    currentUser.id = user.id;

    currentUser.isActive = true;

    const findConditions: FindConditions<Cart> = {
      id,
      isActive: true,
      user: currentUser,
    };

    const deleted = await this.cartRepository.update(findConditions, {
      isActive: false,
    });

    return handleDeleteOne(deleted);
  }

  findQuery(currentUserId: number) {
    return this.cartRepository
      .createQueryBuilder(cartEntityName)

      .andWhere(`${cartEntityName}.userId = :userId`, {
        userId: currentUserId,
      })
      .innerJoin(
        `${cartEntityName}.course`,
        courseEntityName,
        `${courseEntityName}.isActive = true`,
      )
      .select(`${cartEntityName}.id`);
  }

  findAllQuery(findAllCartsDto: FindAllCartsDto, currentUserId: number) {
    const { courseId, id } = findAllCartsDto;

    let query = this.findQuery(currentUserId).andWhere(
      `${cartEntityName}.isActive = true`,
    );

    if (courseId) {
      if (Array.isArray(courseId)) {
        query = query.andWhere(
          new Brackets((qb) => {
            qb.where(`${courseEntityName}.id = :courseIdFirstItem`, {
              courseIdFirstItem: +courseId[0],
            });

            for (
              let i = 1, courseIdLength = courseId.length;
              i < courseIdLength;
              i += 1
            ) {
              qb.orWhere(`${courseEntityName}.id = :courseId${i}`, {
                [`courseId${i}`]: +courseId[i],
              });
            }
          }),
        );
      } else {
        query = query.andWhere(`${courseEntityName}.id = :courseId`, {
          courseId,
        });
      }
    }

    if (id) {
      if (Array.isArray(id)) {
        query = query.andWhere(
          new Brackets((qb) => {
            qb.where(`${cartEntityName}.id = :idFirstItem`, {
              idFirstItem: +id[0],
            });

            for (let i = 1, idLength = id.length; i < idLength; i += 1) {
              qb.orWhere(`${cartEntityName}.id = :cartId${i}`, {
                [`cartId${i}`]: +id[i],
              });
            }
          }),
        );
      } else {
        query = query.andWhere(`${cartEntityName}.id = :id`, {
          id,
        });
      }
    }

    return query;
  }

  findOneQuery(
    findOneCartConditions: FindOneCartConditions,
    currentUserId: number,
  ) {
    const { id, courseId } = findOneCartConditions;

    let query = this.findQuery(currentUserId);

    if (id) {
      query = query.andWhere(`${cartEntityName}.id = :id`, { id });
    } else if (courseId) {
      if (courseId) {
        query = query.andWhere(`${courseEntityName}.id = :courseId`, {
          courseId,
        });
      }

      return query;
    }

    throw new BadRequestException('Dữ liệu đầu vào không đúng');
  }
}
