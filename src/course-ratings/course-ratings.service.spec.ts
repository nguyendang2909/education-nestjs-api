import { Test, TestingModule } from '@nestjs/testing';
import { CourseRatingsService } from './course-ratings.service';

describe('CourseRatingsService', () => {
  let service: CourseRatingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseRatingsService],
    }).compile();

    service = module.get<CourseRatingsService>(CourseRatingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
