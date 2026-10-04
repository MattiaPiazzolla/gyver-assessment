import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { AdvertisementsService } from './advertisements.service';
import { FindAdvertisementsQueryDto } from './dto/find-advertisements-query.dto';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { CreateAdvertisementVariantDto } from './dto/create-advertisement-variant.dto';
import { UpdateAdvertisementVariantDto } from './dto/update-advertisement-variant.dto';
import { AdvertisementVariantParamsDto } from './dto/advertisement-variant-params.dto';

@Controller('advertisements')
export class AdvertisementsController {
  constructor(
    private readonly advertisementsService: AdvertisementsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Headers('x-company-id') companyId: string,
    @Body() dto: CreateAdvertisementDto,
  ) {
    if (!companyId) {
      throw new UnauthorizedException(
        'Header x-company-id mancante o non valido',
      );
    }
    return this.advertisementsService.create(companyId, dto);
  }

  @Post(':advertisementId/variants')
  @HttpCode(HttpStatus.CREATED)
  async createVariant(
    @Headers('x-company-id') companyId: string,
    @Param('advertisementId') advertisementId: string,
    @Body() dto: CreateAdvertisementVariantDto,
  ) {
    if (!companyId) {
      throw new UnauthorizedException(
        'Header x-company-id mancante o non valido',
      );
    }
    return this.advertisementsService.createVariant(
      advertisementId,
      companyId,
      dto,
    );
  }

  @Patch(':advertisementId/variants/:variantId')
  @HttpCode(HttpStatus.OK)
  async updateVariant(
    @Headers('x-company-id') companyId: string,
    @Param() params: AdvertisementVariantParamsDto,
    @Body() dto: UpdateAdvertisementVariantDto,
  ) {
    if (!companyId) {
      throw new UnauthorizedException(
        'Header x-company-id mancante o non valido',
      );
    }
    return this.advertisementsService.updateVariant(
      params.advertisementId,
      params.variantId,
      companyId,
      dto,
    );
  }

  @Get()
  async findAll(
    @Headers('x-company-id') companyId: string,
    @Query() query: FindAdvertisementsQueryDto,
  ) {
    if (!companyId) {
      throw new UnauthorizedException(
        'Header x-company-id mancante o non valido',
      );
    }
    return this.advertisementsService.findAllByCompany(companyId, query);
  }

  @Get(':id')
  async findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ) {
    if (!companyId) {
      throw new UnauthorizedException(
        'Header x-company-id mancante o non valido',
      );
    }
    return this.advertisementsService.findOneByCompany(id, companyId);
  }
}