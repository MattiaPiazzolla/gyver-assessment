import { IsNotEmpty, Matches } from 'class-validator';

export class AdvertisementVariantParamsDto {
  @Matches(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    { message: 'advertisementId deve essere un formato UUID valido' },
  )
  @IsNotEmpty({ message: 'advertisementId è obbligatorio' })
  advertisementId: string;

  @Matches(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    { message: 'variantId deve essere un formato UUID valido' },
  )
  @IsNotEmpty({ message: 'variantId è obbligatorio' })
  variantId: string;
}