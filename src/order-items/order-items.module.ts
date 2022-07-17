import { Module } from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
// import { PurchasesController } from './purchases.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './entities/order-item.entity';
import { TeacherOrderItemsService } from './teacher-order-items.service';
import { TeacherOrderItemsController } from './teacher-order-items.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItem])],
  exports: [OrderItemsService],
  controllers: [TeacherOrderItemsController],
  providers: [OrderItemsService, TeacherOrderItemsService],
})
export class OrderItemsModule {}
