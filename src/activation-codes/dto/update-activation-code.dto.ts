import { PartialType } from '@nestjs/swagger';
import { CreateActivationCodeDto } from './create-activation-code.dto';

export class UpdateActivationCodeDto extends PartialType(
  CreateActivationCodeDto,
) {}
