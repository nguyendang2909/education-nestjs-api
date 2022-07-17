import { FindManyType } from 'src/commons/dtos';

export class FindOneTeacherConditions {
  id: number;
}

export class FindAllTeachersDto {
  // sort
}

export class FindManyTeachersDto extends FindManyType(FindAllTeachersDto) {}
