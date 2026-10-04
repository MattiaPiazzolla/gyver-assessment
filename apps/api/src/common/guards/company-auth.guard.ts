import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class CompanyAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const companyId = request.headers['x-company-id'];

    if (
      !companyId ||
      typeof companyId !== 'string' ||
      !UUID_REGEX.test(companyId)
    ) {
      throw new UnauthorizedException(
        'Header "x-company-id" mancante o non valido. È richiesto un UUID valido.',
      );
    }

    request.companyId = companyId;
    return true;
  }
}