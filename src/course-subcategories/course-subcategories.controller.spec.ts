import { Test, TestingModule } from '@nestjs/testing';
import { CourseSubcategoriesController } from './course-subcategories.controller';
import { CourseSubcategoriesService } from './course-subcategories.service';

describe('CourseSubcategoriesController', () => {
  let controller: CourseSubcategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseSubcategoriesController],
      providers: [CourseSubcategoriesService],
    }).compile();

    controller = module.get<CourseSubcategoriesController>(
      CourseSubcategoriesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
