import { Test, TestingModule } from '@nestjs/testing';
import { ActivationCodesService } from './admin-activation-codes.service';

describe('ActivationCodesService', () => {
  let service: ActivationCodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivationCodesService],
    }).compile();

    service = module.get<ActivationCodesService>(ActivationCodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
