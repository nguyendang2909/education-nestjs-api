import { Test, TestingModule } from '@nestjs/testing';
import { CourseActiveCodesService } from './course-active-codes.service';

describe('CourseActiveCodesService', () => {
  let service: CourseActiveCodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseActiveCodesService],
    }).compile();

    service = module.get<CourseActiveCodesService>(CourseActiveCodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
