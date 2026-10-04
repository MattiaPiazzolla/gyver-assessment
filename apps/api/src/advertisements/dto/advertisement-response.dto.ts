import { ad_status, channel_type, format_type } from '@prisma/client';

export class AdvertisementVariantSummaryDto {
  id: string;
  variantName: string;
  isSelected: boolean;
  isEdited: boolean;
}

export class AdvertisementVariantDetailDto extends AdvertisementVariantSummaryDto {
  headline: string;
  bodyText: string;
  callToAction: string;
  creativeNotes: string | null;
  generatedHeadline: string;
  generatedBody: string;
  generatedCta: string;
  createdAt: Date;
  updatedAt: Date;
}

export class JobOfferSummaryDto {
  id: string;
  title: string;
  defaultLocation?: string;
}

export class JobOfferDetailDto extends JobOfferSummaryDto {
  description: string;
  requirements: string;
  declare defaultLocation: string;
}

export class AdvertisementListItemDto {
  id: string;
  jobOffer: JobOfferSummaryDto;
  channel: channel_type;
  format: format_type;
  targetLocation: string;
  status: ad_status;
  variantsCount: number;
  variants: AdvertisementVariantSummaryDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class AdvertisementDetailDto {
  id: string;
  channel: channel_type;
  format: format_type;
  targetLocation: string;
  status: ad_status;
  jobOffer: JobOfferDetailDto;
  variants: AdvertisementVariantDetailDto[];
  createdAt: Date;
  updatedAt: Date;
}