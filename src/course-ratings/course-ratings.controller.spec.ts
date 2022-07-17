import { Test, TestingModule } from '@nestjs/testing';
import { CourseRatingsController } from './course-ratings.controller';
import { CourseRatingsService } from './course-ratings.service';

describe('CourseRatingsController', () => {
  let controller: CourseRatingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseRatingsController],
      providers: [CourseRatingsService],
    }).compile();

    controller = module.get<CourseRatingsController>(CourseRatingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
