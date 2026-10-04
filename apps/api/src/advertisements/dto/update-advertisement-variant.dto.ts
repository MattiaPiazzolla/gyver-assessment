import { IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class UpdateAdvertisementVariantDto {
  @IsString({ message: 'headline deve essere una stringa' })
  @IsOptional()
  @MaxLength(255, { message: 'headline non può superare 255 caratteri' })
  headline?: string;

  @IsString({ message: 'bodyText deve essere una stringa' })
  @IsOptional()
  bodyText?: string;

  @IsString({ message: 'callToAction deve essere una stringa' })
  @IsOptional()
  @MaxLength(100, { message: 'callToAction non può superare 100 caratteri' })
  callToAction?: string;

  @ValidateIf((_, value) => value !== null)
  @IsString({ message: 'creativeNotes deve essere una stringa o null' })
  @IsOptional()
  @MaxLength(1000, { message: 'creativeNotes non può superare 1000 caratteri' })
  creativeNotes?: string | null;
}