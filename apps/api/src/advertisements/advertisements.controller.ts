import { Controller, Get, Param } from '@nestjs/common';
import { AdvertisementsService } from './advertisements.service';
import { IdParamDto } from '../common/dto/id-param.dto';

@Controller('advertisements')
export class AdvertisementsController {
  constructor(private readonly advertisementsService: AdvertisementsService) {}

  @Get()
  async findAll() {
    return this.advertisementsService.findAll();
  }

  @Get(':id')
  async findOne(@Param() params: IdParamDto) {
    return this.advertisementsService.findOne(params.id);
  }
}