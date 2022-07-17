import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User, UserId } from 'src/commons/decorators';
import { ParamsWithId } from 'src/commons/dtos';
import { UserWithoutPassword } from 'src/users/users.type';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import {
  FindAllCartsDto,
  FindManyCartsDto,
  FindOneCartDto,
} from './dto/find-cart.dto';

@Controller('carts')
@ApiTags('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  async create(@Body() createCartDto: CreateCartDto, @UserId() userId: number) {
    return {
      type: 'cart',
      data: await this.cartsService.create(createCartDto, userId),
    };
  }

  @Get()
  async findMany(
    @Query() findManyCartsDto: FindManyCartsDto,
    @UserId() currentUserId: number,
  ) {
    return {
      type: 'carts',
      data: await this.cartsService.findMany(findManyCartsDto, currentUserId),
    };
  }

  @Get('/count')
  async count(
    @Query() findAllCartsDto: FindAllCartsDto,
    @UserId() currentUserId: number,
  ) {
    return {
      type: 'countCarts',
      data: await this.cartsService.count(findAllCartsDto, currentUserId),
    };
  }

  @Get('/price')
  async findPrice(
    @Query() findCartPriceDto: FindAllCartsDto,
    @UserId() userId: number,
  ) {
    return {
      type: 'cartPrice',
      data: await this.cartsService.findCartPrice(findCartPriceDto, userId),
    };
  }

  @Get(':id')
  async findOneById(
    @Param() params: ParamsWithId,
    @Query() findOneCartDto: FindOneCartDto,
    @UserId() userId: number,
  ) {
    return {
      type: 'cartItem',
      data: await this.cartsService.findOneOrFailById(
        +params.id,
        findOneCartDto,
        userId,
      ),
    };
  }

  // @Patch(':id')
  // update(@Param() params: ParamsWithId, @Body() updateCartDto: UpdateCartDto) {
  //   return this.cartsService.update(+params.id, updateCartDto);
  // }

  @Delete(':id')
  remove(@Param() params: ParamsWithId, @User() user: UserWithoutPassword) {
    return this.cartsService.remove(+params.id, user);
  }
}
