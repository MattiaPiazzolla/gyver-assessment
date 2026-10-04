import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class JobOffersService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(companyId?: string) {
    return this.db.job_offers.findMany({
      where: companyId ? { company_id: companyId } : undefined,
      orderBy: { created_at: 'asc' },
    });
  }

  async findOne(id: string) {
    const jobOffer = await this.db.job_offers.findUnique({
      where: { id },
    });

    if (!jobOffer) {
      throw new NotFoundException(`Offerta di lavoro con ID ${id} non trovata.`);
    }

    return jobOffer;
  }
}