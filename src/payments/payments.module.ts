import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { OrdersModule } from 'src/orders/orders.module';
import { MomoPaymentsController } from './momo-payments.controller';
import { MomoPaymentsService } from './momo-payments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    OrdersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('JWT_PAYMENT_SECRET'),
          signOptions: {
            expiresIn: '300d',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [PaymentsController, MomoPaymentsController],
  providers: [PaymentsService, MomoPaymentsService],
})
export class PaymentsModule {}
