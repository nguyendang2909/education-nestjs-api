import { Test, TestingModule } from '@nestjs/testing';
import { CourseQuestionsController } from './course-questions.controller';
import { CourseQuestionsService } from './course-questions.service';

describe('CourseQuestionsController', () => {
  let controller: CourseQuestionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseQuestionsController],
      providers: [CourseQuestionsService],
    }).compile();

    controller = module.get<CourseQuestionsController>(
      CourseQuestionsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
