import { Test, TestingModule } from '@nestjs/testing';
import { CoursePartsController } from './course-parts.controller';
import { CoursePartsService } from './course-parts.service';

describe('CoursePartsController', () => {
  let controller: CoursePartsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursePartsController],
      providers: [CoursePartsService],
    }).compile();

    controller = module.get<CoursePartsController>(CoursePartsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
