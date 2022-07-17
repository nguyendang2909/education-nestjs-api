import { forwardRef, Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { CoursesModule } from 'src/courses/courses.module';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { AdminCartsService } from './admin-carts.service';
import { OrderItemsModule } from 'src/order-items/order-items.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart]),
    forwardRef(() => CoursesModule),
    UsersModule,
    OrderItemsModule,
  ],
  exports: [AdminCartsService, CartsService],
  controllers: [CartsController],
  providers: [CartsService, AdminCartsService],
})
export class CartsModule {}
