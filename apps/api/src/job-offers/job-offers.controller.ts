import { Controller, Get, Headers, Param } from '@nestjs/common';
import { JobOffersService } from './job-offers.service';
import { IdParamDto } from '../common/dto/id-param.dto';

const DEFAULT_COMPANY_ID = 'a0000000-0000-0000-0000-000000000001';

@Controller('job-offers')
export class JobOffersController {
  constructor(private readonly jobOffersService: JobOffersService) {}

  @Get()
  async findAll(@Headers('x-company-id') companyId?: string) {
    const activeCompanyId = companyId || DEFAULT_COMPANY_ID;
    return this.jobOffersService.findAll(activeCompanyId);
  }

  @Get(':id')
  async findOne(@Param() params: IdParamDto) {
    return this.jobOffersService.findOne(params.id);
  }
}