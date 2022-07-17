import { Controller, Get, Body, Patch, Param, Query } from '@nestjs/common';
import { RequireRoles } from 'src/commons/decorators';
import { AdminOrdersService } from './admin-orders.service';
import { ParamsWithId } from 'src/commons/dtos';
import { ERole } from 'src/users/users.enum';
import { AFindManyOrdersDto } from './dto/admin-find-orders.dto';
import { AUpdateOrderDto } from './dto/admin-update-order.dto';

@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly adminOrdersService: AdminOrdersService) {}

  // @Post()
  // @RequireRoles([ERole.Admin])
  // async create(@Body() aCreateOrderDto: ACreateOrderDto) {
  //   return {
  //     type: 'createOrder',
  //     data: await this.adminOrdersService.create(aCreateOrderDto),
  //   };
  // }

  @Get()
  @RequireRoles([ERole.Admin])
  async findMany(@Query() aFindManyOrdersDto: AFindManyOrdersDto) {
    return {
      type: 'adminOrders',
      data: await this.adminOrdersService.findMany(aFindManyOrdersDto),
    };
  }

  @Get('/count')
  @RequireRoles([ERole.Admin])
  async count(@Query() aFindManyOrdersDto: AFindManyOrdersDto) {
    return {
      type: 'adminCountOrders',
      data: await this.adminOrdersService.count(aFindManyOrdersDto),
    };
  }

  @Get(':id')
  @RequireRoles([ERole.Admin])
  async findOneById(@Param() params: ParamsWithId) {
    return {
      type: 'adminOrders',
      data: await this.adminOrdersService.findOneOrFailById(+params.id),
    };
  }

  @Patch(':id')
  @RequireRoles([ERole.Admin])
  async update(
    @Param('id') id: string,
    @Body() aUpdateOrderDto: AUpdateOrderDto,
  ) {
    return {
      type: 'adminUpdateOrder',
      data: await this.adminOrdersService.update(+id, aUpdateOrderDto),
    };
  }

  // @Delete(':id')
  // @RequireRoles([ERole.Admin])
  // remove(@Param('id') id: string) {
  //   return this.adminOrdersService.remove(+id);
  // }
}
