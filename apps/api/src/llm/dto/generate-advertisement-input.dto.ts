// apps/api/src/llm/dto/generate-advertisement-input.dto.ts
import { channel_type, format_type } from '@prisma/client';

export interface JobOfferInput {
  title: string;
  description: string;
  requirements: string;
  defaultLocation: string;
}

export interface GenerateAdvertisementInput {
  jobOffer: JobOfferInput;
  channel: channel_type;
  format: format_type;
  targetLocation: string;
  variantsCount?: number;
  variantGoals?: string[];
}