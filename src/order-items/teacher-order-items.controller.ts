import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequireRoles, UserId } from 'src/commons/decorators';
import { ERole } from 'src/users/users.enum';
import {
  TFindAllOrderItemsDto,
  TFindManyOrderItemsDto,
} from './dto/teacher-find-order-item.dto';
import { TFindRevenueDto } from './dto/teacher-find-revenue';
import { TeacherOrderItemsService } from './teacher-order-items.service';

@Controller('teacher/order-items')
@ApiTags('teacher/order-items')
export class TeacherOrderItemsController {
  constructor(
    private readonly teacherOrderItemsService: TeacherOrderItemsService,
  ) {}

  @Get()
  @RequireRoles([ERole.Admin, ERole.Teacher])
  async findMany(
    @Query() tFindManyOrderItemsDto: TFindManyOrderItemsDto,
    @UserId() userId: number,
  ) {
    return {
      type: 'orders',
      data: await this.teacherOrderItemsService.findMany(
        tFindManyOrderItemsDto,
        userId,
      ),
    };
  }

  @Get()
  @RequireRoles([ERole.Admin, ERole.Teacher])
  async count(
    @Query() tFindAllOrderItemsDto: TFindAllOrderItemsDto,
    @UserId() userId: number,
  ) {
    return {
      type: 'orders',
      data: await this.teacherOrderItemsService.count(
        tFindAllOrderItemsDto,
        userId,
      ),
    };
  }

  @Get('/revenue')
  @RequireRoles([ERole.Admin, ERole.Teacher])
  async findRevenue(
    @Query() tFindRevenueDto: TFindRevenueDto,
    @UserId() userId: number,
  ) {
    return {
      type: 'teacherRevenue',
      data: await this.teacherOrderItemsService.findRevenue(
        tFindRevenueDto,
        userId,
      ),
    };
  }

  // @Get(':id')
  // @RequireRoles([ERole.Admin, ERole.Teacher])
  // async findOneById(@Param('id') id: string, @UserId() currentUserId: number) {
  //   return {
  //     type: 'order',
  //     data: await this.teacherOrderItemsService.findOneOrFailById(
  //       +id,
  //       currentUserId,
  //     ),
  //   };
  // }
}
