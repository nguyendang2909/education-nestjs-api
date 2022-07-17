import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { CartsModule } from 'src/carts/carts.module';
import { AdminOrdersService } from './admin-orders.service';
import { AdminOrdersController } from './admin-orders.controller';
import { OrderItemsModule } from 'src/order-items/order-items.module';
import { OrdersUtil } from './orders.util';
import { UsersModule } from 'src/users/users.module';
import { CoursesModule } from 'src/courses/courses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    CartsModule,
    OrderItemsModule,
    UsersModule,
    CoursesModule,
  ],
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrdersService, AdminOrdersService, OrdersUtil],
})
export class OrdersModule {}
