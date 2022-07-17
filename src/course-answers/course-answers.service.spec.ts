import { Test, TestingModule } from '@nestjs/testing';
import { CourseAnswersService } from './course-answers.service';

describe('CourseAnswersService', () => {
  let service: CourseAnswersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseAnswersService],
    }).compile();

    service = module.get<CourseAnswersService>(CourseAnswersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
