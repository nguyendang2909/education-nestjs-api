import { Test, TestingModule } from '@nestjs/testing';
import { CourseAnswersController } from './course-answers.controller';
import { CourseAnswersService } from './course-answers.service';

describe('CourseAnswersController', () => {
  let controller: CourseAnswersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseAnswersController],
      providers: [CourseAnswersService],
    }).compile();

    controller = module.get<CourseAnswersController>(CourseAnswersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
