import {
  Controller,
  Get,
  Body,
  Param,
  HttpCode,
  Res,
  Post,
} from '@nestjs/common';
import { IsPublic, UserId } from 'src/commons/decorators';
import { MomoPaymentsService } from './momo-payments.service';
import { ParamsWithId } from 'src/commons/dtos';
import { Response } from 'express';

@Controller('payments/momo')
export class MomoPaymentsController {
  constructor(private readonly momopaymentsService: MomoPaymentsService) {}

  @IsPublic()
  @HttpCode(204)
  @Post('/confirm')
  async confirmMomoPayment(@Body() body: Record<any, any>) {
    await this.momopaymentsService.confirmMomoPayment(body);

    return {
      message: 'Payment successfully',
    };
  }

  @Get(':id')
  async getMomoPayURL(
    @Param() params: ParamsWithId,
    @UserId() userId: number,
    @Res() response: Response,
  ) {
    return {
      type: 'momo',
      data: await this.momopaymentsService.getMomoPayUrl(
        +params.id,
        userId,
        response,
      ),
    };
  }
}
