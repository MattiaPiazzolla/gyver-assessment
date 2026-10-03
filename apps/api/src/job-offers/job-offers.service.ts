import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class JobOffersService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.job_offers.findMany({
      orderBy: { created_at: 'desc' },
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