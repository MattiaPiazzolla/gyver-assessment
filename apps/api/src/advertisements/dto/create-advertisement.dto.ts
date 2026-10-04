import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { channel_type, format_type } from '@prisma/client';

export class CreateAdvertisementDto {
  @Matches(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    { message: 'jobOfferId deve essere un formato UUID valido' },
  )
  @IsNotEmpty({ message: 'jobOfferId è obbligatorio' })
  jobOfferId: string;

  @IsEnum(channel_type, {
    message:
      'channel deve essere un valore valido tra: JOB_BOARD, WHATSAPP, INSTAGRAM, TIKTOK',
  })
  @IsNotEmpty({ message: 'channel è obbligatorio' })
  channel: channel_type;

  @IsEnum(format_type, {
    message:
      'format deve essere un valore valido tra: JOB_POSTING, MESSAGE, FEED_POST, STORY',
  })
  @IsNotEmpty({ message: 'format è obbligatorio' })
  format: format_type;

  @IsString({ message: 'targetLocation deve essere una stringa' })
  @IsOptional()
  @MaxLength(255, { message: 'targetLocation non può superare 255 caratteri' })
  targetLocation?: string;

  @IsString({ message: 'variantGoals deve essere una stringa' })
  @IsOptional()
  @MaxLength(500, { message: 'variantGoals non può superare 500 caratteri' })
  variantGoals?: string;
}