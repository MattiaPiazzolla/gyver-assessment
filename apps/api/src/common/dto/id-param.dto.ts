import { Matches } from 'class-validator';

export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class IdParamDto {
  @Matches(UUID_REGEX, { message: "L'ID fornito deve essere un UUID valido." })
  id: string;
}