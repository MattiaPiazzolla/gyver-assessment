// apps/api/src/llm/dto/generated-advertisement-output.dto.ts
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class GeneratedVariantDto {
  @IsString({ message: "L'headline deve essere una stringa." })
  @IsNotEmpty({ message: "L'headline non può essere vuota." })
  headline: string;

  @IsString({ message: 'Il bodyText deve essere una stringa.' })
  @IsNotEmpty({ message: 'Il bodyText non può essere vuoto.' })
  bodyText: string;

  @IsString({ message: 'La callToAction deve essere una stringa.' })
  @IsNotEmpty({ message: 'La callToAction non può essere vuota.' })
  callToAction: string;

  @IsOptional()
  @IsString({ message: 'Le creativeNotes devono essere una stringa.' })
  creativeNotes?: string;
}

export class GeneratedAdvertisementOutputDto {
  @IsArray({ message: 'variants deve essere un array.' })
  @ArrayMinSize(1, { message: 'È richiesta almeno una variante generata.' })
  @ValidateNested({ each: true })
  @Type(() => GeneratedVariantDto)
  variants: GeneratedVariantDto[];
}