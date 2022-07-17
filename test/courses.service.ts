// import {
//   BadRequestException,
//   ForbiddenException,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { courseSubcategoryEntityName } from 'src/course-subcategories/entities/course-subcategory.entity';
// import { Course, courseEntityName } from './entities/course.entity';
// import {
//   FindAllCoursesDto,
//   FindManyCourseDto,
//   FindOneCourseConditions,
// } from './dto/find-course.dto';
// import { userEntityName } from 'src/users/entities/user.entity';
// import { handleFindOne } from 'src/commons/record-handlers';
// import { Messages, messagesService } from 'src/commons/messages';
// import { courseCategoryName } from 'src/course-categories/entities/course-category.entity';
// import { FileManagerService } from 'src/file-manager/file-manager.service';
// import { coursePartEntityName } from 'src/course-parts/entities/course-part.entity';
// import { lessonEntityName } from 'src/lessons/entities/lesson.entity';
// import { cartEntityName } from 'src/carts/entities/cart.entity';
// import { courseRatingEntityName } from 'src/course-ratings/entities/course-rating.entity';
// import { GetCourseStreamVideoDto } from './dto/get-course-stream-video.dto';
// import { Request, Response } from 'express';
// import fs from 'fs';
// import { entityUtils } from 'src/commons/utils/entities.util';
// import { CoursesUtil } from './courses.util';
// import { UsersUtil } from 'src/users/users.util';
// import { Repository, SelectQueryBuilder } from 'typeorm';
// import { InjectRepository } from '@nestjs/typeorm';
// import { ECoursePublish } from './courses.type';
// import { courseQuestionEntityName } from 'src/course-questions/entities/course-question.entity';
// import { EBooleanString } from 'src/commons/enums';
// import { orderItemEntityName } from 'src/order-items/entities/order-item.entity';
// import { orderEntityName } from 'src/orders/entities/order.entity';

// @Injectable()
// export class CoursesService {
//   constructor(
//     @InjectRepository(Course)
//     private readonly courseRepository: Repository<Course>,
//     private readonly coursesUtil: CoursesUtil,
//     private readonly fileManagerService: FileManagerService,
//     private readonly usersUtil: UsersUtil,
//   ) {}

//   async findMany(findManyCourseDto: FindManyCourseDto, userId?: number) {
//     const { currentPage, sortBy, pageSize, ...findDto } = findManyCourseDto;

//     const { take, skip } = entityUtils.getPagination({
//       currentPage: currentPage,
//       pageSize: pageSize,
//     });

//     let query = this.findAllQuery(findDto, userId)
//       .addSelect([
//         `${courseEntityName}.name`,
//         `${courseEntityName}.price`,
//         `${courseEntityName}.promotionPrice`,
//         `${courseEntityName}.coverImageURL`,
//         `${courseEntityName}.publish`,
//         `${courseEntityName}.certificate`,
//         `${courseEntityName}.createdAt`,
//       ])
//       .addSelect([
//         `${courseSubcategoryEntityName}.id`,
//         `${courseSubcategoryEntityName}.name`,
//       ])
//       .addSelect([
//         `${courseCategoryName}.id`,
//         `${courseCategoryName}.name`,
//         `${courseCategoryName}.icon`,
//       ])
//       .addSelect([
//         `${userEntityName}.id`,
//         `${userEntityName}.title`,
//         `${userEntityName}.fullname`,
//         `${userEntityName}.avatarURL`,
//         `${userEntityName}.facebookFullname`,
//         `${userEntityName}.facebookAvatarURL`,
//         `${userEntityName}.googleFullname`,
//         `${userEntityName}.googleAvatarURL`,
//         `${userEntityName}.isActive`,
//       ]);

//     if (sortBy) {
//       switch (sortBy) {
//         case 'newest':
//           query = query.addOrderBy(`${courseEntityName}.createdAt`, 'DESC');
//           break;

//         case 'popularity':
//           query = query.addOrderBy(`countStudents`, 'DESC');
//           break;

//         default:
//           query = query.addOrderBy(`${courseEntityName}.createdAt`, 'DESC');
//           break;
//       }
//     }

//     query = query.take(take).skip(skip);

//     const found = await query.getRawAndEntities();

//     const raw = found.raw;

//     console.log(found.entities);

//     const result = found.entities.map((course, i) => {
//       const { user, ...extraCourseProps } = course;

//       return {
//         ...extraCourseProps,
//         user: this.usersUtil.parse(user),
//         countRatings: raw[i].countRatings ? +raw[i].countRatings : undefined,
//         averageRatings: raw[i].averageRatings
//           ? +raw[i].averageRatings
//           : undefined,
//         countStudents: raw[i].countStudents ? +raw[i].countStudents : undefined,
//       };
//     });

//     return result;
//   }

//   async count(
//     findAllCoursesDto: FindAllCoursesDto,
//     userId?: number,
//   ): Promise<number> {
//     const query = this.findAllQuery(findAllCoursesDto, userId);

//     const count = await query.getCount();

//     return count;
//   }

//   async findOneOrFailById(id: number) {
//     let query = this.findOneQuery({ id });

//     query = query.addSelect([
//       // course
//       `${courseEntityName}.coverImageURL`,
//       `${courseEntityName}.bannerURL`,
//       `${courseEntityName}.introductionVideoURL`,
//       `${courseEntityName}.subTitle`,
//       `${courseEntityName}.about`,
//       `${courseEntityName}.output`,
//       `${courseEntityName}.publish`,
//       `${courseEntityName}.name`,
//       `${courseEntityName}.price`,
//       `${courseEntityName}.promotionPrice`,
//       `${courseEntityName}.duration`,
//       `${courseEntityName}.updatedAt`,
//       `${courseEntityName}.certificate`,
//       // Course subcategory
//       `${courseSubcategoryEntityName}.id`,
//       `${courseSubcategoryEntityName}.name`,
//       //  Course category
//       `${courseCategoryName}.id`,
//       `${courseCategoryName}.name`,
//       `${courseCategoryName}.icon`,
//       //  Teacher
//       `${userEntityName}.id`,
//       `${userEntityName}.title`,
//       `${userEntityName}.fullname`,
//       `${userEntityName}.avatarURL`,
//       `${userEntityName}.facebookFullname`,
//       `${userEntityName}.facebookAvatarURL`,
//       `${userEntityName}.googleFullname`,
//       `${userEntityName}.googleAvatarURL`,
//       // Course part
//       `${coursePartEntityName}.id`,
//       `${coursePartEntityName}.name`,
//       //  Lesson
//       `${lessonEntityName}.id`,
//       `${lessonEntityName}.name`,
//       `${lessonEntityName}.videoURL`,
//       `${lessonEntityName}.trial`,
//     ]);

//     const found = await query.getOne();

//     if (!found) {
//       throw new NotFoundException(
//         messagesService.setNotFound(Messages.course.name),
//       );
//     }

//     let countLessons = 0;

//     const { coursePart: currentCoursePart, user, ...extraCourseProps } = found;

//     const courseParts = currentCoursePart.map((coursePart) => {
//       const { lesson: currentLessons, ...extraCoursePartProps } = coursePart;

//       const lessons = currentLessons.map((lesson) => {
//         countLessons += 1;

//         return {
//           ...lesson,
//           number: countLessons,
//         };
//       });

//       return {
//         ...extraCoursePartProps,
//         lesson: lessons,
//       };
//     });

//     return {
//       // updatedAt: moment(updatedAt).format('DD-MM-YYYY'),
//       ...extraCourseProps,
//       user: this.usersUtil.parse(user),
//       coursePart: courseParts,
//       countLessons,
//       // countStudents: raw?.countStudents ? +raw.countStudents : undefined,
//       // averageRatings: raw?.averageRatings
//       //   ? +(+raw.averageRatings).toFixed(1)
//       //   : undefined,
//       // countRatings: raw?.countRatings ? raw.countRatings : undefined,
//     };
//   }

//   // async findOneOrFailById(id: number, userId?: number) {
//   //   const found = await this.findOneById(id, userId);

//   //   return handleFindOne(found, Messages.course.name);
//   // }

//   async learnOrFailById(id: number, userId: number) {
//     let query = this.findOneQuery({ id });

//     query = query.innerJoinAndMapOne(
//       `${courseEntityName}.purchase`,
//       `${orderItemEntityName}.${orderEntityName}`,
//       `${orderEntityName}a`,
//       `${orderEntityName}a.paid = true AND ${orderEntityName}a.isActive = true AND ${orderEntityName}a.userId = :orderUserId`,
//       {
//         orderUserId: userId,
//       },
//     );

//     query = query.leftJoinAndMapOne(
//       `${courseEntityName}.rating`,
//       `${courseEntityName}.${courseRatingEntityName}`,
//       courseRatingEntityName,
//       `${courseRatingEntityName}.isActive = true AND ${courseRatingEntityName}.${userEntityName} = :courseRatingUserId`,
//       { courseRatingUserId: userId },
//     );

//     query = query.addSelect([
//       // course
//       `${courseEntityName}.coverImageURL`,
//       `${courseEntityName}.bannerURL`,
//       `${courseEntityName}.introductionVideoURL`,
//       `${courseEntityName}.subTitle`,
//       `${courseEntityName}.about`,
//       `${courseEntityName}.output`,
//       `${courseEntityName}.publish`,
//       `${courseEntityName}.name`,
//       `${courseEntityName}.price`,
//       `${courseEntityName}.promotionPrice`,
//       `${courseEntityName}.duration`,
//       `${courseEntityName}.updatedAt`,
//       `${courseEntityName}.certificate`,
//       // Course subcategory
//       `${courseSubcategoryEntityName}.id`,
//       `${courseSubcategoryEntityName}.name`,
//       //  Course category
//       `${courseCategoryName}.id`,
//       `${courseCategoryName}.name`,
//       `${courseCategoryName}.icon`,
//       //  Teacher
//       `${userEntityName}.id`,
//       `${userEntityName}.fullname`,
//       `${userEntityName}.avatarURL`,
//       `${userEntityName}.facebookFullname`,
//       `${userEntityName}.facebookAvatarURL`,
//       `${userEntityName}.googleFullname`,
//       `${userEntityName}.googleAvatarURL`,
//       // Course part
//       `${coursePartEntityName}.id`,
//       `${coursePartEntityName}.name`,
//       //  Lesson
//       `${lessonEntityName}.id`,
//       `${lessonEntityName}.name`,
//       `${lessonEntityName}.videoURL`,
//       `${lessonEntityName}.trial`,
//     ]);

//     const course = await query.getOne();

//     if (!course) {
//       throw new ForbiddenException('Bạn chưa đăng ký khoá học này');
//     }

//     const parsedCourse = this.coursesUtil.parse(course);

//     let lessonCount = 0;

//     const { coursePart: currentCoursePart, ...extraCourseProps } = parsedCourse;

//     const courseParts = currentCoursePart.map((coursePart, index) => {
//       const { lesson: currentLessons, ...extraCoursePartProps } = coursePart;

//       const lessons = currentLessons.map((lesson) => {
//         lessonCount += 1;

//         return {
//           ...lesson,
//           order: lessonCount,
//         };
//       });

//       return {
//         ...extraCoursePartProps,
//         order: index + 1,
//         lesson: lessons,
//       };
//     });

//     return {
//       ...extraCourseProps,
//       coursePart: courseParts,
//       lessonCount,
//     };
//   }

//   async validateBought(id: number, userId: number) {
//     const query = this.findOneQuery({ id }).innerJoinAndMapOne(
//       `${courseEntityName}.purchase`,
//       `${orderItemEntityName}.${orderEntityName}`,
//       `${orderEntityName}a`,
//       `${orderEntityName}a.paid = true AND ${orderEntityName}a.isActive = true AND ${orderEntityName}a.userId = :orderUserId`,
//       {
//         orderUserId: userId,
//       },
//     );

//     const course = await query.getOne();

//     if (!course) {
//       throw new BadRequestException('Bạn chưa đăng ký khoá học');
//     }

//     return course;
//   }

//   // async learnOrFailById(id: number, userId: number): Promise<Course> {
//   //   const learnCourse = await this.learnById(id, userId);

//   // }

//   async streamVideo(
//     id: number,
//     getStreamVideoDto: GetCourseStreamVideoDto,
//     req: Request,
//     res: Response,
//   ) {
//     const existCourse = await this.findOneQuery({ id })
//       .addSelect([`${courseEntityName}.introductionVideoURL`])
//       .getOne();

//     if (!existCourse) {
//       throw new NotFoundException(
//         messagesService.setNotFound(Messages.course.name),
//       );
//     }

//     const { introductionVideoURL } = existCourse;

//     if (!introductionVideoURL) {
//       throw new NotFoundException();
//     }

//     const videoPath = introductionVideoURL;

//     const videoStat = fs.statSync(introductionVideoURL);

//     const fileSize = videoStat.size;

//     const videoRange = req.headers.range;

//     if (videoRange) {
//       const parts = videoRange.replace(/bytes=/, '').split('-');

//       const start = parseInt(parts[0], 10);

//       const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

//       const chunksize = end - start + 1;

//       const file = fs.createReadStream(videoPath, { start, end });

//       const head = {
//         'Content-Range': `bytes ${start}-${end}/${fileSize}`,
//         'Accept-Ranges': 'bytes',
//         'Content-Length': chunksize,
//         'Content-Type': 'video/mp4',
//       };

//       res.writeHead(206, head);

//       file.pipe(res);
//     } else {
//       const head = {
//         'Content-Length': fileSize,
//         'Content-Type': 'video/mp4',
//       };

//       res.writeHead(200, head);

//       fs.createReadStream(videoPath).pipe(res);
//     }
//   }

//   findQuery(): SelectQueryBuilder<Course> {
//     const query = this.courseRepository
//       .createQueryBuilder(courseEntityName)
//       .where(`${courseEntityName}.isActive = true`)
//       .andWhere(`${courseEntityName}.publish = :publishStatus`, {
//         publishStatus: ECoursePublish.Published,
//       })
//       .leftJoin(
//         `${courseEntityName}.${courseSubcategoryEntityName}`,
//         `${courseSubcategoryEntityName}`,
//       )
//       .leftJoin(
//         `${courseSubcategoryEntityName}.${courseCategoryName}`,
//         `${courseCategoryName}`,
//       )
//       .leftJoin(`${courseEntityName}.${userEntityName}`, `${userEntityName}`)
//       .leftJoin(
//         `${courseEntityName}.${orderItemEntityName}`,
//         orderItemEntityName,
//         `${orderItemEntityName}.isActive = true`,
//       )
//       .leftJoin(
//         `${orderItemEntityName}.${orderEntityName}`,
//         orderEntityName,
//         `${orderEntityName}.isActive = true`,
//       );
//     return query;
//   }

//   findAllQuery(
//     findAllCoursesDto: FindAllCoursesDto,
//     currentUserId?: number,
//   ): SelectQueryBuilder<Course> {
//     const {
//       name,
//       courseSubcategoryId: courseSubcategoryIdAsString,
//       courseCategoryId: courseCategoryIdAsString,
//       teacherId: teacherIdAsString,
//       price,
//       // commonPrice,
//       purchase,
//       showCountQuestions,
//       promotion,
//       free,
//     } = findAllCoursesDto;

//     let query = this.findQuery();

//     if (courseCategoryIdAsString) {
//       const courseCategoryId = +courseCategoryIdAsString;

//       query = query.andWhere(`${courseCategoryName}.id = :courseCategoryId`, {
//         courseCategoryId,
//       });
//     }

//     if (courseSubcategoryIdAsString) {
//       const courseSubcategoryId = +courseSubcategoryIdAsString;

//       query = query.andWhere(
//         `${courseSubcategoryEntityName}.id = :courseSubcategoryId`,
//         { courseSubcategoryId },
//       );
//     }

//     if (name) {
//       query = query.andWhere(`${courseEntityName}.name like :name`, {
//         name: `%${name}%`,
//       });
//     }

//     if (teacherIdAsString) {
//       query = query.andWhere(`${userEntityName}.id = :teacherId`, {
//         teacherId: +teacherIdAsString,
//       });
//     }

//     if (price) {
//       query = query.andWhere(`${courseEntityName}.price = :price`, { price });
//     }

//     if (promotion && promotion === 'true') {
//       query = query.andWhere(`${courseEntityName}.promotionPrice IS NOT NULL`);
//     }

//     if (free && free === 'true') {
//       query = query.andWhere(
//         `(${courseEntityName}.price = 0 OR ${courseEntityName}.promotionPrice = 0 )`,
//       );
//     }

//     query = query.select([`${courseEntityName}.id`]);

//     if (purchase !== undefined && currentUserId) {
//       query = query
//         .innerJoin(
//           `${courseEntityName}.${orderItemEntityName}`,
//           `${orderItemEntityName}purchase`,
//           `${orderItemEntityName}purchase.isActive = true`,
//         )
//         .innerJoin(
//           `${orderItemEntityName}purchase.${orderEntityName}`,
//           `${orderEntityName}purchase`,
//           `${orderEntityName}purchase.isActive = true AND ${orderEntityName}purchase.paid = :purchase AND ${orderEntityName}purchase.userId = :boughtUserId`,
//           {
//             boughtUserId: currentUserId,
//             purchase: purchase === EBooleanString.True,
//           },
//         );
//     }

//     if (showCountQuestions === 'true') {
//       query = query.loadRelationCountAndMap(
//         `${courseEntityName}.countQuestions`,
//         `${courseEntityName}.${courseQuestionEntityName}`,
//         courseQuestionEntityName,
//         (qb) => qb.andWhere(`${courseQuestionEntityName}.isActive = true`),
//       );
//     }

//     query = query
//       .addSelect(`COUNT(DISTINCT(${orderItemEntityName}.id))`, 'countStudents')
//       .leftJoin(
//         `${courseEntityName}.${courseRatingEntityName}`,
//         courseRatingEntityName,
//         `${courseRatingEntityName}.isActive = true`,
//       )
//       .addSelect(`AVG(${courseRatingEntityName}.rating)`, `averageRatings`)
//       .addSelect(
//         `COUNT(DISTINCT(${courseRatingEntityName}.id))`,
//         `countRatings`,
//       )
//       .groupBy(`${courseEntityName}.id`);

//     return query;
//   }

//   findOneQuery(
//     findOneCourseConditions: FindOneCourseConditions,
//   ): SelectQueryBuilder<Course> {
//     const { id } = findOneCourseConditions;

//     const query = this.findQuery()
//       .andWhere(`${courseEntityName}.id = :id`, { id })
//       .leftJoin(
//         `${courseEntityName}.${coursePartEntityName}`,
//         `${coursePartEntityName}`,
//         `${coursePartEntityName}.isActive = true`,
//       )
//       .leftJoin(
//         `${coursePartEntityName}.${lessonEntityName}`,
//         `${lessonEntityName}`,
//         `${lessonEntityName}.isActive = true`,
//       )
//       .orderBy({
//         [`${coursePartEntityName}.orderPosition`]: 'ASC',
//         [`${lessonEntityName}.orderPosition`]: 'ASC',
//       })
//       .select(`${courseEntityName}.id`)
//       //
//       // .addSelect(`COUNT(DISTINCT(${orderItemEntityName}.id))`, 'countStudents')
//       // .leftJoin(
//       //   `${courseEntityName}.${courseRatingEntityName}`,
//       //   courseRatingEntityName,
//       //   `${courseRatingEntityName}.isActive = true`,
//       // )
//       // .addSelect(
//       //   `AVG(DISTINCT(${courseRatingEntityName}.rating))`,
//       //   `averageRatings`,
//       // )
//       // .addSelect(
//       //   `COUNT(DISTINCT(${courseRatingEntityName}.id))`,
//       //   `countRatings`,
//       // )
//       // .groupBy(`${courseEntityName}.id`);

//       // .leftJoin(
//       //   `${courseEntityName}.${cartEntityName}`,
//       //   `${cartEntityName}`,
//       //   `${cartEntityName}.isActive = true AND ${cartEntityName}.paid = true`,
//       // )
//       .loadRelationCountAndMap(
//         `${courseEntityName}.countStudents`,
//         `${courseEntityName}.${orderItemEntityName}`,
//         `${orderItemEntityName}`,
//         (qb) =>
//           qb.andWhere(
//             `${orderItemEntityName}.isActive = true AND ${orderEntityName}.paid = true`,
//           ),
//       )
//       .loadRelationCountAndMap(
//         `${courseEntityName}.countRatings`,
//         `${courseEntityName}.${courseRatingEntityName}`,
//         `${courseRatingEntityName}`,
//         (qb) => qb.andWhere(`${courseRatingEntityName}.isActive = true`),
//       );

//     // *********
//     // .addSelect(`COUNT(DISTINCT(${cartEntityName}.id))`, 'countStudents')
//     // .leftJoin(
//     //   `${courseEntityName}.${courseRatingEntityName}`,
//     //   courseRatingEntityName,
//     //   `${courseRatingEntityName}.isActive = true`,
//     // )
//     // .addSelect(`AVG(${courseRatingEntityName}.rating)`, `averageRatings`)
//     // .addSelect(
//     //   `COUNT(DISTINCT(${courseRatingEntityName}.id))`,
//     //   `countRatings`,
//     // )
//     // .groupBy(`${courseEntityName}.id`);
//     // ****************

//     return query;
//   }
// }
