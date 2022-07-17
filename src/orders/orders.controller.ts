import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UserId } from 'src/commons/decorators';
import { FindAllOrdersDto, FindManyOrdersDto } from './dto/find-order.dto';
import { ParamsWithId } from 'src/commons/dtos';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @UserId() userId: number,
  ) {
    return {
      type: 'createOrder',
      data: await this.ordersService.create(createOrderDto, userId),
    };
  }

  @Get()
  async findMany(
    @Query() findManyOrdersDto: FindManyOrdersDto,
    @UserId() userId: number,
  ) {
    return {
      type: 'orders',
      data: await this.ordersService.findMany(findManyOrdersDto, userId),
    };
  }

  @Get('/count')
  async count(
    @Query() findAllOrdersDto: FindAllOrdersDto,
    @UserId() userId: number,
  ) {
    return {
      type: 'orders',
      data: await this.ordersService.count(findAllOrdersDto, userId),
    };
  }

  @Get(':id')
  async findOneById(
    @Param() params: ParamsWithId,
    @UserId() currentUserId: number,
  ) {
    return {
      type: 'order',
      data: await this.ordersService.findOneOrFailById(
        +params.id,
        currentUserId,
      ),
    };
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @UserId() userId: number,
  ) {
    return this.ordersService.update(+id, updateOrderDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
