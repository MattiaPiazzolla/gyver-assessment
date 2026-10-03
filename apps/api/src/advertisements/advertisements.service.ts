import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AdvertisementsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.advertisements.findMany({
      include: {
        job_offers: {
          select: { id: true, title: true },
        },
        advertisement_variants: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const advertisement = await this.db.advertisements.findUnique({
      where: { id },
      include: {
        job_offers: true,
        advertisement_variants: true,
      },
    });

    if (!advertisement) {
      throw new NotFoundException(`Annuncio con ID ${id} non trovato.`);
    }

    return advertisement;
  }
}