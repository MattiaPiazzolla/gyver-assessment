import { IsNotEmpty, IsUUID } from 'class-validator';

export class AdvertisementIdParamDto {
  @IsUUID('4', { message: 'advertisementId deve essere uno UUID v4 valido' })
  @IsNotEmpty({ message: 'advertisementId è obbligatorio' })
  advertisementId: string;
}