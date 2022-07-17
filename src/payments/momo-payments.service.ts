import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import _ from 'lodash';
import { Messages, messagesService } from 'src/commons/messages';
import { orderItemEntityName } from 'src/order-items/entities/order-item.entity';

import { PaymentsService } from './payments.service';
import crypto from 'crypto';
import https from 'https';
import { Response } from 'express';
import { EPaymentMethod } from 'src/orders/orders.enum';

@Injectable()
export class MomoPaymentsService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly paymentsService: PaymentsService,
  ) {}

  logger = new Logger(MomoPaymentsService.name);

  async confirmMomoPayment(body: Record<any, any>) {
    if (!body || !body.extraData) {
      throw new BadRequestException();
    }

    const decodedOrderJwt = this.jwtService.verify<{ id?: number }>(
      body.extraData,
    );

    if (!decodedOrderJwt.id || !_.isNumber(decodedOrderJwt.id)) {
      throw new BadRequestException();
    }

    await this.paymentsService.pay(decodedOrderJwt.id, EPaymentMethod.Momo);
  }

  async getMomoPayUrl(id: number, currentUserId: number, response: Response) {
    const order = await this.paymentsService
      .findOneOrderQueryById({ id }, currentUserId)
      .addSelect([
        `${orderItemEntityName}.price`,
        `${orderItemEntityName}.promotionPrice`,
      ])
      .getOne();

    if (!order) {
      throw new NotFoundException(
        messagesService.setNotFound(Messages.order.name),
      );
    }

    const { totalPrice: amount } = this.paymentsService.getPrice(order);

    const partnerCode = process.env.MOMO_PARTNER_CODE || '';

    const accessKey = process.env.MOMO_ACCESS_KEY || '';

    const secretkey = process.env.MOMO_SECRET_KEY || '';

    const extraData = this.jwtService.sign({ id });

    const ipnUrl = `${process.env.API_URL}/payments/momo/confirm`;

    const redirectUrl = `${process.env.UI_URL}/don-hang/${order.id}`;

    const orderInfo = `Đơn hàng từ ${Messages.app.shortTitleDomain}`;

    const requestId = partnerCode + new Date().getTime();

    const orderId = `${order.id}-${requestId}`;

    const requestType = 'captureWallet';

    const rawSignature =
      'accessKey=' +
      accessKey +
      '&amount=' +
      amount +
      '&extraData=' +
      extraData +
      '&ipnUrl=' +
      ipnUrl +
      '&orderId=' +
      orderId +
      '&orderInfo=' +
      orderInfo +
      '&partnerCode=' +
      partnerCode +
      '&redirectUrl=' +
      redirectUrl +
      '&requestId=' +
      requestId +
      '&requestType=' +
      requestType;

    const signature = crypto
      .createHmac('sha256', secretkey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = JSON.stringify({
      partnerCode: partnerCode,
      accessKey: accessKey,
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      extraData: extraData,
      requestType: requestType,
      signature: signature,
      lang: 'en',
    });

    const options = {
      hostname: process.env.MOMO_API_ENDPOINT,
      port: 443,
      path: '/v2/gateway/api/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };

    const req = https.request(options, (res) => {
      res.setEncoding('utf8');

      res.on('data', (body) => {
        const responseData = JSON.parse(body);

        if (responseData.payUrl) {
          response
            .status(200)
            .send({ type: 'momo', data: JSON.parse(body).payUrl });
        } else {
          this.logger.error(
            'Cannot get data from Momo ' + responseData.message,
          );
          response.status(400).send({ message: responseData.message });
        }
      });

      res.on('end', () => {
        this.logger.debug('Finish connect to Momo');
      });
    });

    req.on('error', (e) => {
      console.log(`problem with request: ${e.message}`);
    });

    req.write(requestBody);

    req.end();

    // const result = await axios.post(
    //   `https://test-payment.momo.vn/v2/gateway/api/create`,
    //   {
    //     partnerCode: partnerCode,
    //     accessKey: accessKey,
    //     requestId: requestId,
    //     amount: amount,
    //     orderId: orderId,
    //     orderInfo: orderInfo,
    //     redirectUrl: redirectUrl,
    //     ipnUrl: ipnUrl,
    //     extraData: extraData,
    //     requestType: requestType,
    //     signature: signature,
    //     lang: 'en',
    //   },
    //   {
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Content-Length': `${Buffer.byteLength(requestBody)}`,
    //     },
    //   },
    // );

    // console.log(result);
  }
}
