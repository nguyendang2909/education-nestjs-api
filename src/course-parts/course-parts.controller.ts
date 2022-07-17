import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsAllowPublic, RequireRoles, User } from 'src/commons/decorators';
import { ParamsWithId } from 'src/commons/dtos';
import { ERole } from 'src/users/users.enum';
import { UserWithoutPassword } from 'src/users/users.type';
import { CoursePartsService } from './course-parts.service';

@Controller('course-parts')
@ApiTags('course-parts')
export class CoursePartsController {
  constructor(private readonly coursePartsService: CoursePartsService) {}

  @Get('/:id')
  @IsAllowPublic()
  @RequireRoles([ERole.Admin, ERole.Teacher])
  async findOneById(
    @Param() params: ParamsWithId,
    @User() user: UserWithoutPassword,
  ) {
    return {
      type: 'coursePart',
      data: await this.coursePartsService.findOneOrFailById(
        +params.id,

        user,
      ),
    };
  }
}
