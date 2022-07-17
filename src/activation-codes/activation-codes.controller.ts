import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ActivationCodesService } from './admin-activation-codes.service';
import { CreateActivationCodeDto } from './dto/create-activation-code.dto';
import { UpdateActivationCodeDto } from './dto/update-activation-code.dto';

@Controller('activation-codes')
export class ActivationCodesController {
  constructor(
    private readonly activationCodesService: ActivationCodesService,
  ) {}

  @Post()
  create(@Body() createActivationCodeDto: CreateActivationCodeDto) {
    return this.activationCodesService.create(createActivationCodeDto);
  }

  @Get()
  findAll() {
    return this.activationCodesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activationCodesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateActivationCodeDto: UpdateActivationCodeDto,
  ) {
    return this.activationCodesService.update(+id, updateActivationCodeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activationCodesService.remove(+id);
  }
}
