import { Test, TestingModule } from '@nestjs/testing';
import { ActivationCodesController } from './activation-codes.controller';
import { ActivationCodesService } from './admin-activation-codes.service';

describe('ActivationCodesController', () => {
  let controller: ActivationCodesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivationCodesController],
      providers: [ActivationCodesService],
    }).compile();

    controller = module.get<ActivationCodesController>(
      ActivationCodesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
