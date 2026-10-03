import { IsUUID } from 'class-validator';

export class IdParamDto {
  @IsUUID('4', { message: "L'ID fornito deve essere un UUID v4 valido." })
  id: string;
}