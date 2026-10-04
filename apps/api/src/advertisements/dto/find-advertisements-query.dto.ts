import { IsEnum, IsOptional, Matches } from 'class-validator';
import { channel_type } from '@prisma/client';
import { UUID_REGEX } from '../../common/dto/id-param.dto';

export class FindAdvertisementsQueryDto {
  @IsOptional()
  @Matches(UUID_REGEX, {
    message: 'Il parametro jobOfferId deve essere un UUID valido.',
  })
  jobOfferId?: string;

  @IsOptional()
  @IsEnum(channel_type, {
    message: `Il canale deve essere uno tra: ${Object.values(channel_type).join(', ')}`,
  })
  channel?: channel_type;
}