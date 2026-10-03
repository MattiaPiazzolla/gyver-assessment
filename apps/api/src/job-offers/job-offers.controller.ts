import { Controller, Get, Param } from '@nestjs/common';
import { JobOffersService } from './job-offers.service';
import { IdParamDto } from '../common/dto/id-param.dto';

@Controller('job-offers')
export class JobOffersController {
  constructor(private readonly jobOffersService: JobOffersService) {}

  @Get()
  async findAll() {
    return this.jobOffersService.findAll();
  }

  @Get(':id')
  async findOne(@Param() params: IdParamDto) {
    return this.jobOffersService.findOne(params.id);
  }
}