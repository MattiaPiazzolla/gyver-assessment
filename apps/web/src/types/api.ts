export type AdvertisementChannel = 'JOB_BOARD' | 'WHATSAPP' | 'INSTAGRAM' | 'TIKTOK';
export type AdvertisementFormat = 'JOB_POSTING' | 'MESSAGE' | 'FEED_POST' | 'STORY';
export type AdvertisementStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface AdvertisementVariant {
  id: string;
  advertisementId: string;
  variantName: string;
  generatedHeadline: string;
  generatedBodyText: string;
  generatedCallToAction: string;
  generatedCreativeNotes: string | null;
  editedHeadline: string | null;
  editedBodyText: string | null;
  editedCallToAction: string | null;
  editedCreativeNotes: string | null;
  headline: string;
  bodyText: string;
  callToAction: string;
  creativeNotes: string | null;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobOfferSummary {
  id: string;
  companyId?: string;
  title: string;
  description?: string;
  requirements?: string | string[];
  default_location?: string;
  defaultLocation?: string;
  location?: string;
  department?: string;
  employmentType?: string;
  seniorityLevel?: string;
  responsibilities?: string[];
  benefits?: string[];
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdvertisementListItem {
  id: string;
  companyId?: string;
  jobOfferId?: string;
  channel: AdvertisementChannel;
  format: AdvertisementFormat;
  status: AdvertisementStatus;
  targetLocation: string | null;
  jobOffer: {
    id: string;
    title: string;
    location?: string;
    defaultLocation?: string;
  };
  variantsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdvertisementDetail {
  id: string;
  companyId: string;
  jobOfferId: string;
  channel: AdvertisementChannel;
  format: AdvertisementFormat;
  status: AdvertisementStatus;
  targetLocation: string | null;
  jobOffer: JobOfferSummary;
  variants: AdvertisementVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdvertisementPayload {
  jobOfferId: string;
  channel: AdvertisementChannel;
  format: AdvertisementFormat;
  targetLocation?: string;
  variantGoals?: string;
}

export interface CreateVariantPayload {
  variantGoals?: string;
}

export interface UpdateVariantPayload {
  headline?: string;
  bodyText?: string;
  callToAction?: string;
  creativeNotes?: string | null;
}

export interface AdvertisementFilters {
  jobOfferId?: string;
  channel?: AdvertisementChannel;
}