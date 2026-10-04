// apps/api/src/advertisements/advertisements.service.ts
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { FindAdvertisementsQueryDto } from './dto/find-advertisements-query.dto';
import {
  AdvertisementListItemDto,
  AdvertisementDetailDto,
} from './dto/advertisement-response.dto';
import { Prisma } from '@prisma/client';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { CreateAdvertisementVariantDto } from './dto/create-advertisement-variant.dto';
import { UpdateAdvertisementVariantDto } from './dto/update-advertisement-variant.dto';
import { GenerateAdvertisementInput } from '../llm/dto/generate-advertisement-input.dto';
import { GeneratedVariantDto } from '../llm/dto/generated-advertisement-output.dto';
import { LlmService } from '../llm/llm.service';

export interface AdvertisementVariantResponseDto {
  id: string;
  advertisementId?: string;
  variantName: string;
  headline: string;
  bodyText: string;
  callToAction: string;
  creativeNotes: string | null;
  generatedHeadline: string;
  generatedBody: string;
  generatedCta: string;
  isEdited: boolean;
  isSelected: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AdvertisementsService {
  private readonly logger = new Logger(AdvertisementsService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly llmService: LlmService,
  ) {}

  async getAuthorizedJobOffer(jobOfferId: string, companyId: string) {
    const jobOffer = await this.db.job_offers.findFirst({
      where: {
        id: jobOfferId,
        company_id: companyId,
      },
      select: {
        id: true,
        company_id: true,
        title: true,
        description: true,
        requirements: true,
        default_location: true,
      },
    });

    if (!jobOffer) {
      throw new NotFoundException(
        `Offerta di lavoro con ID ${jobOfferId} non trovata.`,
      );
    }

    return jobOffer;
  }

  prepareLlmInput(
    jobOffer: {
      title: string;
      description: string;
      requirements: string;
      default_location: string;
    },
    dto: CreateAdvertisementDto,
  ): GenerateAdvertisementInput {
    const targetLocation = dto.targetLocation?.trim()
      ? dto.targetLocation.trim()
      : jobOffer.default_location;

    return {
      jobOffer: {
        title: jobOffer.title,
        description: jobOffer.description,
        requirements: jobOffer.requirements,
        defaultLocation: jobOffer.default_location,
      },
      channel: dto.channel,
      format: dto.format,
      targetLocation,
      variantsCount: 1,
      variantGoals: dto.variantGoals?.trim() ? [dto.variantGoals.trim()] : undefined,
    };
  }

  async generateFirstVariant(
    jobOffer: {
      title: string;
      description: string;
      requirements: string;
      default_location: string;
    },
    dto: CreateAdvertisementDto,
  ): Promise<GeneratedVariantDto> {
    const llmInput = this.prepareLlmInput(jobOffer, dto);
    const output = await this.llmService.generateAdvertisement(llmInput);
    return output.variants[0];
  }

  async create(
    companyId: string,
    dto: CreateAdvertisementDto,
  ): Promise<AdvertisementDetailDto> {
    const jobOffer = await this.getAuthorizedJobOffer(dto.jobOfferId, companyId);

    let generatedVariant: GeneratedVariantDto;
    try {
      generatedVariant = await this.generateFirstVariant(jobOffer, dto);
    } catch (error) {
      this.logger.error(
        `Errore generazione LLM durante creazione annuncio: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      if (
        error instanceof BadRequestException ||
        error instanceof UnprocessableEntityException
      ) {
        throw error;
      }
      throw new BadGatewayException(
        'Impossibile generare il contenuto pubblicitario tramite il provider AI. Riprova più tardi.',
      );
    }

    const targetLocation = dto.targetLocation?.trim()
      ? dto.targetLocation.trim()
      : jobOffer.default_location;

    try {
      const createdAd = await this.db.advertisements.create({
        data: {
          job_offer_id: jobOffer.id,
          channel: dto.channel,
          format: dto.format,
          target_location: targetLocation,
          advertisement_variants: {
            create: {
              variant_name: 'Variante 1',
              headline: generatedVariant.headline,
              body_text: generatedVariant.bodyText,
              call_to_action: generatedVariant.callToAction,
              creative_notes: generatedVariant.creativeNotes ?? null,
              generated_headline: generatedVariant.headline,
              generated_body: generatedVariant.bodyText,
              generated_cta: generatedVariant.callToAction,
              is_edited: false,
              is_selected: false,
            },
          },
        },
        include: {
          job_offers: {
            select: {
              id: true,
              title: true,
              description: true,
              requirements: true,
              default_location: true,
            },
          },
          advertisement_variants: {
            orderBy: { created_at: 'asc' },
          },
        },
      });

      return {
        id: createdAd.id,
        channel: createdAd.channel,
        format: createdAd.format,
        targetLocation: createdAd.target_location,
        status: createdAd.status,
        jobOffer: {
          id: createdAd.job_offers.id,
          title: createdAd.job_offers.title,
          description: createdAd.job_offers.description,
          requirements: createdAd.job_offers.requirements,
          defaultLocation: createdAd.job_offers.default_location,
        },
        variants: createdAd.advertisement_variants.map((v) => ({
          id: v.id,
          variantName: v.variant_name,
          headline: v.headline,
          bodyText: v.body_text,
          callToAction: v.call_to_action,
          creativeNotes: v.creative_notes,
          generatedHeadline: v.generated_headline,
          generatedBody: v.generated_body,
          generatedCta: v.generated_cta,
          isEdited: v.is_edited,
          isSelected: v.is_selected,
          createdAt: v.created_at,
          updatedAt: v.updated_at,
        })),
        createdAt: createdAd.created_at,
        updatedAt: createdAd.updated_at,
      };
    } catch (error) {
      this.logger.error(
        `Errore database durante creazione annuncio: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw new InternalServerErrorException(
        'Errore durante il salvataggio persistente dell annuncio.',
      );
    }
  }

  async createVariant(
    advertisementId: string,
    companyId: string,
    dto: CreateAdvertisementVariantDto,
  ): Promise<AdvertisementVariantResponseDto> {
    const advertisement = await this.db.advertisements.findFirst({
      where: {
        id: advertisementId,
        job_offers: {
          company_id: companyId,
        },
      },
      include: {
        job_offers: {
          select: {
            id: true,
            title: true,
            description: true,
            requirements: true,
            default_location: true,
          },
        },
        advertisement_variants: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!advertisement) {
      throw new NotFoundException(
        `Annuncio con ID ${advertisementId} non trovato.`,
      );
    }

    const nextVariantNumber = advertisement.advertisement_variants.length + 1;
    const variantName = `Variante ${nextVariantNumber}`;

    const llmInput: GenerateAdvertisementInput = {
      jobOffer: {
        title: advertisement.job_offers.title,
        description: advertisement.job_offers.description,
        requirements: advertisement.job_offers.requirements,
        defaultLocation: advertisement.job_offers.default_location,
      },
      channel: advertisement.channel,
      format: advertisement.format,
      targetLocation: advertisement.target_location,
      variantsCount: 1,
      variantGoals: dto.variantGoals?.trim() ? [dto.variantGoals.trim()] : undefined,
    };

    let generatedVariant: GeneratedVariantDto;
    try {
      const output = await this.llmService.generateAdvertisement(llmInput);
      generatedVariant = output.variants[0];
    } catch (error) {
      this.logger.error(
        `Errore generazione LLM durante creazione variante per ad ${advertisementId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      if (
        error instanceof BadRequestException ||
        error instanceof UnprocessableEntityException
      ) {
        throw error;
      }
      throw new BadGatewayException(
        'Impossibile generare la variante pubblicitaria tramite il provider AI. Riprova più tardi.',
      );
    }

    try {
      const savedVariant = await this.db.advertisement_variants.create({
        data: {
          advertisement_id: advertisement.id,
          variant_name: variantName,
          headline: generatedVariant.headline,
          body_text: generatedVariant.bodyText,
          call_to_action: generatedVariant.callToAction,
          creative_notes: generatedVariant.creativeNotes ?? null,
          generated_headline: generatedVariant.headline,
          generated_body: generatedVariant.bodyText,
          generated_cta: generatedVariant.callToAction,
          is_edited: false,
          is_selected: false,
        },
      });

      return {
        id: savedVariant.id,
        variantName: savedVariant.variant_name,
        headline: savedVariant.headline,
        bodyText: savedVariant.body_text,
        callToAction: savedVariant.call_to_action,
        creativeNotes: savedVariant.creative_notes,
        generatedHeadline: savedVariant.generated_headline,
        generatedBody: savedVariant.generated_body,
        generatedCta: savedVariant.generated_cta,
        isEdited: savedVariant.is_edited,
        isSelected: savedVariant.is_selected,
        createdAt: savedVariant.created_at,
        updatedAt: savedVariant.updated_at,
      };
    } catch (error) {
      this.logger.error(
        `Errore database durante creazione variante per ad ${advertisementId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw new InternalServerErrorException(
        'Errore durante il salvataggio della variante pubblicitaria.',
      );
    }
  }

  async updateVariant(
    advertisementId: string,
    variantId: string,
    companyId: string,
    dto: UpdateAdvertisementVariantDto,
  ): Promise<AdvertisementVariantResponseDto> {
    const hasAtLeastOneField =
      dto.headline !== undefined ||
      dto.bodyText !== undefined ||
      dto.callToAction !== undefined ||
      dto.creativeNotes !== undefined;

    if (!hasAtLeastOneField) {
      throw new BadRequestException(
        'Il payload di aggiornamento non può essere vuoto.',
      );
    }

    const variant = await this.db.advertisement_variants.findFirst({
      where: {
        id: variantId,
        advertisement_id: advertisementId,
        advertisements: {
          job_offers: {
            company_id: companyId,
          },
        },
      },
    });

    if (!variant) {
      throw new NotFoundException(
        `Variante con ID ${variantId} non trovata per l'annuncio specificato.`,
      );
    }

    const nextHeadline = dto.headline !== undefined ? dto.headline.trim() : variant.headline;
    const nextBodyText = dto.bodyText !== undefined ? dto.bodyText.trim() : variant.body_text;
    const nextCallToAction =
      dto.callToAction !== undefined ? dto.callToAction.trim() : variant.call_to_action;
    const nextCreativeNotes =
      dto.creativeNotes !== undefined
        ? dto.creativeNotes === null
          ? null
          : dto.creativeNotes.trim()
        : variant.creative_notes;

    const isDifferentFromOriginal =
      nextHeadline !== variant.generated_headline ||
      nextBodyText !== variant.generated_body ||
      nextCallToAction !== variant.generated_cta;

    try {
      const updated = await this.db.advertisement_variants.update({
        where: { id: variant.id },
        data: {
          headline: nextHeadline,
          body_text: nextBodyText,
          call_to_action: nextCallToAction,
          creative_notes: nextCreativeNotes,
          is_edited: isDifferentFromOriginal,
        },
      });

      return {
        id: updated.id,
        advertisementId: updated.advertisement_id,
        variantName: updated.variant_name,
        headline: updated.headline,
        bodyText: updated.body_text,
        callToAction: updated.call_to_action,
        creativeNotes: updated.creative_notes,
        generatedHeadline: updated.generated_headline,
        generatedBody: updated.generated_body,
        generatedCta: updated.generated_cta,
        isEdited: updated.is_edited,
        isSelected: updated.is_selected,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      };
    } catch (error) {
      this.logger.error(
        `Errore database durante aggiornamento variante ${variantId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw new InternalServerErrorException(
        'Errore durante il salvataggio della variante modificata.',
      );
    }
  }

  async findAllByCompany(
    companyId: string,
    filters: FindAdvertisementsQueryDto,
  ): Promise<AdvertisementListItemDto[]> {
    const whereClause: Prisma.advertisementsWhereInput = {
      job_offers: {
        company_id: companyId,
      },
    };

    if (filters.jobOfferId) {
      whereClause.job_offer_id = filters.jobOfferId;
    }

    if (filters.channel) {
      whereClause.channel = filters.channel;
    }

    const advertisements = await this.db.advertisements.findMany({
      where: whereClause,
      include: {
        job_offers: {
          select: {
            id: true,
            title: true,
            default_location: true,
          },
        },
        advertisement_variants: {
          select: {
            id: true,
            variant_name: true,
            is_selected: true,
            is_edited: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return advertisements.map((ad) => ({
      id: ad.id,
      jobOffer: {
        id: ad.job_offers.id,
        title: ad.job_offers.title,
        defaultLocation: ad.job_offers.default_location,
      },
      channel: ad.channel,
      format: ad.format,
      targetLocation: ad.target_location,
      status: ad.status,
      variantsCount: ad.advertisement_variants.length,
      variants: ad.advertisement_variants.map((v) => ({
        id: v.id,
        variantName: v.variant_name,
        isSelected: v.is_selected,
        isEdited: v.is_edited,
      })),
      createdAt: ad.created_at,
      updatedAt: ad.updated_at,
    }));
  }

  async findOneByCompany(
    id: string,
    companyId: string,
  ): Promise<AdvertisementDetailDto> {
    const advertisement = await this.db.advertisements.findFirst({
      where: {
        id,
        job_offers: {
          company_id: companyId,
        },
      },
      include: {
        job_offers: {
          select: {
            id: true,
            title: true,
            description: true,
            requirements: true,
            default_location: true,
          },
        },
        advertisement_variants: {
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!advertisement) {
      throw new NotFoundException(`Annuncio con ID ${id} non trovato.`);
    }

    return {
      id: advertisement.id,
      channel: advertisement.channel,
      format: advertisement.format,
      targetLocation: advertisement.target_location,
      status: advertisement.status,
      jobOffer: {
        id: advertisement.job_offers.id,
        title: advertisement.job_offers.title,
        description: advertisement.job_offers.description,
        requirements: advertisement.job_offers.requirements,
        defaultLocation: advertisement.job_offers.default_location,
      },
      variants: advertisement.advertisement_variants.map((v) => ({
        id: v.id,
        variantName: v.variant_name,
        headline: v.headline,
        bodyText: v.body_text,
        callToAction: v.call_to_action,
        creativeNotes: v.creative_notes,
        generatedHeadline: v.generated_headline,
        generatedBody: v.generated_body,
        generatedCta: v.generated_cta,
        isEdited: v.is_edited,
        isSelected: v.is_selected,
        createdAt: v.created_at,
        updatedAt: v.updated_at,
      })),
      createdAt: advertisement.created_at,
      updatedAt: advertisement.updated_at,
    };
  }
}