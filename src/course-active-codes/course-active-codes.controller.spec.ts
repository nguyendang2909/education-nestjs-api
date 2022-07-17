import { Test, TestingModule } from '@nestjs/testing';
import { CourseActiveCodesController } from './course-active-codes.controller';
import { CourseActiveCodesService } from './course-active-codes.service';

describe('CourseActiveCodesController', () => {
  let controller: CourseActiveCodesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseActiveCodesController],
      providers: [CourseActiveCodesService],
    }).compile();

    controller = module.get<CourseActiveCodesController>(
      CourseActiveCodesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
