import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { IsAllowPublic, IsPublic, UserId } from 'src/commons/decorators';
import { ApiTags } from '@nestjs/swagger';
import { ParamsWithId } from 'src/commons/dtos';
import { Request, Response } from 'express';
import { GetLessonStreamVideoDto } from './dto/get-lesson-stream-video.dto';

@Controller('lessons')
@ApiTags('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get('/video/:id')
  async streamVideo(
    @Param() params: ParamsWithId,
    @Query() getStreamVideoDto: GetLessonStreamVideoDto,
    @Req() req: Request,
    @Res() res: Response,
    @UserId() userId: number,
  ) {
    return await this.lessonsService.streamVideo(
      +params.id,
      userId,
      getStreamVideoDto,
      req,
      res,
    );
  }

  @Get('/trial-video/:id')
  @IsPublic()
  async streamTrialVideo(
    @Param() params: ParamsWithId,
    @Query() getStreamVideoDto: GetLessonStreamVideoDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.lessonsService.streamTrialVideo(
      +params.id,
      getStreamVideoDto,
      req,
      res,
    );
  }

  @Get(':id')
  async findOneOrFailById(
    @Param() params: ParamsWithId,
    @UserId() userId: number,
  ) {
    return {
      type: 'lesson',
      data: await this.lessonsService.findOneOrFailById(+params.id, userId),
    };
  }
}
