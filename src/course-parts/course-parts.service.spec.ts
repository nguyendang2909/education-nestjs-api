import { Test, TestingModule } from '@nestjs/testing';
import { CoursePartsService } from './course-parts.service';

describe('CoursePartsService', () => {
  let service: CoursePartsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoursePartsService],
    }).compile();

    service = module.get<CoursePartsService>(CoursePartsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
