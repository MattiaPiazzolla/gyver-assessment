import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAdvertisementVariantDto {
  @IsString({ message: 'variantGoals deve essere una stringa' })
  @IsOptional()
  @MaxLength(500, { message: 'variantGoals non può superare 500 caratteri' })
  variantGoals?: string;
}