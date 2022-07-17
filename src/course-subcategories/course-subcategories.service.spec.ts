import { Test, TestingModule } from '@nestjs/testing';
import { CourseSubcategoriesService } from './course-subcategories.service';

describe('CourseSubcategoriesService', () => {
  let service: CourseSubcategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseSubcategoriesService],
    }).compile();

    service = module.get<CourseSubcategoriesService>(
      CourseSubcategoriesService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
