import { AdvertisementsService } from './advertisements.service';
import { DatabaseService } from '../database/database.service';
import { LlmService } from '../llm/llm.service';
import {
  BadGatewayException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ad_status, channel_type, format_type } from '@prisma/client';
import { jest } from '@jest/globals';

describe('AdvertisementsService', () => {
  let service: AdvertisementsService;
  let db: {
    advertisements: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
    };
    advertisement_variants: {
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    job_offers: {
      findFirst: jest.Mock;
    };
  };
  let llmService: {
    generateAdvertisement: jest.Mock;
  };

  const companyA = 'a0000000-0000-0000-0000-000000000001';
  const companyB = 'b0000000-0000-0000-0000-000000000002';
  const jobOfferId = '00000000-0000-0000-0000-000000000001';
  const adId = 'ccb6ae21-561d-402f-acb6-40e5e18d4460';
  const variantId = '643c9f3f-eadd-4de4-aeeb-37b870c2c686';

  const mockJobOffer = {
    id: jobOfferId,
    company_id: companyA,
    title: 'Senior Frontend Engineer',
    description: 'Cerchiamo un Senior Frontend Engineer con solida esperienza in React e TypeScript.',
    requirements: 'React, TypeScript, Next.js, 5+ anni esperienza',
    default_location: 'Milano (Ibrido)',
  };

  const mockAdRecord = {
    id: adId,
    job_offer_id: jobOfferId,
    channel: channel_type.INSTAGRAM,
    format: format_type.STORY,
    target_location: 'Milano (Ibrido)',
    status: ad_status.DRAFT,
    created_at: new Date('2026-10-04T05:48:55.761Z'),
    updated_at: new Date('2026-10-04T05:48:55.761Z'),
    job_offers: {
      id: jobOfferId,
      title: 'Senior Frontend Engineer',
      description: 'Cerchiamo un Senior Frontend Engineer con solida esperienza in React e TypeScript.',
      requirements: 'React, TypeScript, Next.js, 5+ anni esperienza',
      default_location: 'Milano (Ibrido)',
    },
    advertisement_variants: [
      {
        id: variantId,
        variant_name: 'Variante 1',
        headline: 'Diventa il nostro Senior Frontend Engineer',
        body_text: 'Unisciti al team a Milano (Ibrido). Lavora con React e TypeScript.',
        call_to_action: 'Candidati subito',
        creative_notes: 'Visual dinamico su gradiente scuro.',
        generated_headline: 'Diventa il nostro Senior Frontend Engineer',
        generated_body: 'Unisciti al team a Milano (Ibrido). Lavora con React e TypeScript.',
        generated_cta: 'Candidati subito',
        is_edited: false,
        is_selected: false,
        created_at: new Date('2026-10-04T05:48:55.761Z'),
        updated_at: new Date('2026-10-04T05:48:55.761Z'),
      },
    ],
  };

  beforeEach(() => {
    db = {
      advertisements: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      advertisement_variants: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      job_offers: {
        findFirst: jest.fn(),
      },
    };

    llmService = {
      generateAdvertisement: jest.fn(),
    };

    service = new AdvertisementsService(
      db as unknown as DatabaseService,
      llmService as unknown as LlmService,
    );
  });

  describe('findAllByCompany (Step 9.3)', () => {
    it('dovrebbe restituire la lista annunci filtrata per companyId', async () => {
      db.advertisements.findMany.mockResolvedValue([mockAdRecord]);

      const result = await service.findAllByCompany(companyA, {});

      expect(db.advertisements.findMany).toHaveBeenCalledWith({
        where: {
          job_offers: {
            company_id: companyA,
          },
        },
        include: {
          job_offers: {
            select: { id: true, title: true, default_location: true },
          },
          advertisement_variants: {
            select: {
              id: true,
              variant_name: true,
              is_selected: true,
              is_edited: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(adId);
      expect(result[0].variantsCount).toBe(1);
    });

    it('dovrebbe applicare il filtro jobOfferId nella clausola where', async () => {
      db.advertisements.findMany.mockResolvedValue([mockAdRecord]);

      await service.findAllByCompany(companyA, { jobOfferId });

      expect(db.advertisements.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            job_offer_id: jobOfferId,
            job_offers: { company_id: companyA },
          }),
        }),
      );
    });

    it('dovrebbe applicare il filtro channel nella clausola where', async () => {
      db.advertisements.findMany.mockResolvedValue([mockAdRecord]);

      await service.findAllByCompany(companyA, { channel: channel_type.INSTAGRAM });

      expect(db.advertisements.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            channel: channel_type.INSTAGRAM,
            job_offers: { company_id: companyA },
          }),
        }),
      );
    });

    it('dovrebbe applicare filtri combinati (jobOfferId e channel)', async () => {
      db.advertisements.findMany.mockResolvedValue([mockAdRecord]);

      await service.findAllByCompany(companyA, {
        jobOfferId,
        channel: channel_type.INSTAGRAM,
      });

      expect(db.advertisements.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            job_offer_id: jobOfferId,
            channel: channel_type.INSTAGRAM,
            job_offers: { company_id: companyA },
          }),
        }),
      );
    });
  });

  describe('findOneByCompany (Step 9.3)', () => {
    it('dovrebbe restituire il dettaglio annuncio se autorizzato', async () => {
      db.advertisements.findFirst.mockResolvedValue(mockAdRecord);

      const result = await service.findOneByCompany(adId, companyA);

      expect(db.advertisements.findFirst).toHaveBeenCalledWith({
        where: {
          id: adId,
          job_offers: {
            company_id: companyA,
          },
        },
        include: {
          job_offers: {
            select: {
              id: true,
              title: true,
              description: true,
              requirements: true,
              default_location: true,
            },
          },
          advertisement_variants: {
            orderBy: { created_at: 'asc' },
          },
        },
      });
      expect(result.id).toBe(adId);
      expect(result.jobOffer.title).toBe('Senior Frontend Engineer');
      expect(result.variants).toHaveLength(1);
    });

    it('dovrebbe lanciare NotFoundException se annuncio non esiste', async () => {
      db.advertisements.findFirst.mockResolvedValue(null);

      await expect(service.findOneByCompany('non-existent-id', companyA)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('dovrebbe lanciare NotFoundException in caso di accesso cross-tenant', async () => {
      db.advertisements.findFirst.mockResolvedValue(null);

      await expect(service.findOneByCompany(adId, companyB)).rejects.toThrow(
        NotFoundException,
      );
      expect(db.advertisements.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: adId,
            job_offers: {
              company_id: companyB,
            },
          },
        }),
      );
    });
  });

  describe('create (Step 9.4)', () => {
    const createDto = {
      jobOfferId,
      channel: channel_type.INSTAGRAM,
      format: format_type.STORY,
      targetLocation: 'Milano (Ibrido)',
      variantGoals: 'Focus su stack tecnologico',
    };

    const mockLlmOutput = {
      variants: [
        {
          variantName: 'Variante 1',
          headline: 'Diventa il nostro Senior Frontend Engineer',
          bodyText: 'Unisciti al team a Milano (Ibrido). Lavora con React e TypeScript.',
          callToAction: 'Candidati subito',
          creativeNotes: 'Visual dinamico su gradiente scuro.',
        },
      ],
    };

    it('dovrebbe creare con successo Advertisement e prima Variant con generated_* popolati e isEdited = false', async () => {
      db.job_offers.findFirst.mockResolvedValue(mockJobOffer);
      llmService.generateAdvertisement.mockResolvedValue(mockLlmOutput);
      db.advertisements.create.mockResolvedValue(mockAdRecord);

      const result = await service.create(companyA, createDto);

      expect(db.job_offers.findFirst).toHaveBeenCalledWith({
        where: {
          id: jobOfferId,
          company_id: companyA,
        },
        select: {
          id: true,
          company_id: true,
          title: true,
          description: true,
          requirements: true,
          default_location: true,
        },
      });

      expect(llmService.generateAdvertisement).toHaveBeenCalledWith({
        jobOffer: {
          title: mockJobOffer.title,
          description: mockJobOffer.description,
          requirements: mockJobOffer.requirements,
          defaultLocation: mockJobOffer.default_location,
        },
        channel: channel_type.INSTAGRAM,
        format: format_type.STORY,
        targetLocation: 'Milano (Ibrido)',
        variantsCount: 1,
        variantGoals: ['Focus su stack tecnologico'],
      });

      expect(db.advertisements.create).toHaveBeenCalledWith({
        data: {
          job_offer_id: jobOfferId,
          channel: channel_type.INSTAGRAM,
          format: format_type.STORY,
          target_location: 'Milano (Ibrido)',
          advertisement_variants: {
            create: {
              variant_name: 'Variante 1',
              headline: 'Diventa il nostro Senior Frontend Engineer',
              body_text: 'Unisciti al team a Milano (Ibrido). Lavora con React e TypeScript.',
              call_to_action: 'Candidati subito',
              creative_notes: 'Visual dinamico su gradiente scuro.',
              generated_headline: 'Diventa il nostro Senior Frontend Engineer',
              generated_body: 'Unisciti al team a Milano (Ibrido). Lavora con React e TypeScript.',
              generated_cta: 'Candidati subito',
              is_edited: false,
              is_selected: false,
            },
          },
        },
        include: {
          job_offers: {
            select: {
              id: true,
              title: true,
              description: true,
              requirements: true,
              default_location: true,
            },
          },
          advertisement_variants: {
            orderBy: { created_at: 'asc' },
          },
        },
      });

      expect(result.id).toBe(adId);
      expect(result.variants).toHaveLength(1);
      expect(result.variants[0].isEdited).toBe(false);
      expect(result.variants[0].generatedHeadline).toBe(result.variants[0].headline);
      expect(result.variants[0].generatedBody).toBe(result.variants[0].bodyText);
      expect(result.variants[0].generatedCta).toBe(result.variants[0].callToAction);
    });

    it('dovrebbe ereditare default_location se targetLocation non è specificata', async () => {
      db.job_offers.findFirst.mockResolvedValue(mockJobOffer);
      llmService.generateAdvertisement.mockResolvedValue(mockLlmOutput);
      db.advertisements.create.mockResolvedValue(mockAdRecord);

      await service.create(companyA, {
        jobOfferId,
        channel: channel_type.INSTAGRAM,
        format: format_type.STORY,
      });

      expect(llmService.generateAdvertisement).toHaveBeenCalledWith(
        expect.objectContaining({
          targetLocation: mockJobOffer.default_location,
        }),
      );
      expect(db.advertisements.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            target_location: mockJobOffer.default_location,
          }),
        }),
      );
    });

    it('dovrebbe lanciare NotFoundException se la Job Offer non esiste', async () => {
      db.job_offers.findFirst.mockResolvedValue(null);

      await expect(service.create(companyA, createDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(llmService.generateAdvertisement).not.toHaveBeenCalled();
      expect(db.advertisements.create).not.toHaveBeenCalled();
    });

    it('dovrebbe lanciare NotFoundException in caso di accesso cross-tenant alla Job Offer', async () => {
      db.job_offers.findFirst.mockResolvedValue(null);

      await expect(service.create(companyB, createDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(db.job_offers.findFirst).toHaveBeenCalledWith({
        where: {
          id: jobOfferId,
          company_id: companyB,
        },
        select: {
          id: true,
          company_id: true,
          title: true,
          description: true,
          requirements: true,
          default_location: true,
        },
      });
      expect(llmService.generateAdvertisement).not.toHaveBeenCalled();
      expect(db.advertisements.create).not.toHaveBeenCalled();
    });

    it('dovrebbe lanciare BadGatewayException e non persistere record se il provider LLM fallisce', async () => {
      db.job_offers.findFirst.mockResolvedValue(mockJobOffer);
      llmService.generateAdvertisement.mockRejectedValue(
        new Error('Network error con OpenAI API'),
      );

      await expect(service.create(companyA, createDto)).rejects.toThrow(
        BadGatewayException,
      );

      expect(db.advertisements.create).not.toHaveBeenCalled();
    });
  });

  describe('createVariant (Step 9.5)', () => {
    const createVariantDto = {
      variantGoals: 'Focus su work-life balance e benefit',
    };

    const mockNewVariantRecord = {
      id: '888c9f3f-eadd-4de4-aeeb-37b870c2c999',
      advertisement_id: adId,
      variant_name: 'Variante 2',
      headline: 'Equilibrio e flessibilità per Frontend Dev',
      body_text: 'Lavora in remoto con orari flessibili e benefit dedicati.',
      call_to_action: 'Scopri i benefit',
      creative_notes: 'Visual rilassante.',
      generated_headline: 'Equilibrio e flessibilità per Frontend Dev',
      generated_body: 'Lavora in remoto con orari flessibili e benefit dedicati.',
      generated_cta: 'Scopri i benefit',
      is_edited: false,
      is_selected: false,
      created_at: new Date('2026-10-04T06:00:00.000Z'),
      updated_at: new Date('2026-10-04T06:00:00.000Z'),
    };

    const mockVariantLlmOutput = {
      variants: [
        {
          variantName: 'Variante 2',
          headline: 'Equilibrio e flessibilità per Frontend Dev',
          bodyText: 'Lavora in remoto con orari flessibili e benefit dedicati.',
          callToAction: 'Scopri i benefit',
          creativeNotes: 'Visual rilassante.',
        },
      ],
    };

    it('dovrebbe creare con successo una variante successiva ereditando attributi dall advertisement genitore', async () => {
      db.advertisements.findFirst.mockResolvedValue({
        id: adId,
        channel: channel_type.INSTAGRAM,
        format: format_type.STORY,
        target_location: 'Milano (Ibrido)',
        job_offers: {
          id: jobOfferId,
          title: 'Senior Frontend Engineer',
          description: 'Descrizione job',
          requirements: 'Requisiti job',
          default_location: 'Milano (Ibrido)',
        },
        advertisement_variants: [{ id: variantId }],
      });

      llmService.generateAdvertisement.mockResolvedValue(mockVariantLlmOutput);
      db.advertisement_variants.create.mockResolvedValue(mockNewVariantRecord);

      const result = await service.createVariant(adId, companyA, createVariantDto);

      expect(db.advertisements.findFirst).toHaveBeenCalledWith({
        where: {
          id: adId,
          job_offers: {
            company_id: companyA,
          },
        },
        include: {
          job_offers: {
            select: {
              id: true,
              title: true,
              description: true,
              requirements: true,
              default_location: true,
            },
          },
          advertisement_variants: {
            select: {
              id: true,
            },
          },
        },
      });

      expect(llmService.generateAdvertisement).toHaveBeenCalledWith({
        jobOffer: {
          title: 'Senior Frontend Engineer',
          description: 'Descrizione job',
          requirements: 'Requisiti job',
          defaultLocation: 'Milano (Ibrido)',
        },
        channel: channel_type.INSTAGRAM,
        format: format_type.STORY,
        targetLocation: 'Milano (Ibrido)',
        variantsCount: 1,
        variantGoals: ['Focus su work-life balance e benefit'],
      });

      expect(db.advertisement_variants.create).toHaveBeenCalledWith({
        data: {
          advertisement_id: adId,
          variant_name: 'Variante 2',
          headline: 'Equilibrio e flessibilità per Frontend Dev',
          body_text: 'Lavora in remoto con orari flessibili e benefit dedicati.',
          call_to_action: 'Scopri i benefit',
          creative_notes: 'Visual rilassante.',
          generated_headline: 'Equilibrio e flessibilità per Frontend Dev',
          generated_body: 'Lavora in remoto con orari flessibili e benefit dedicati.',
          generated_cta: 'Scopri i benefit',
          is_edited: false,
          is_selected: false,
        },
      });

      expect(result.id).toBe(mockNewVariantRecord.id);
      expect(result.variantName).toBe('Variante 2');
      expect(result.isEdited).toBe(false);
      expect(result.generatedHeadline).toBe(result.headline);
    });

    it('dovrebbe lanciare NotFoundException se advertisement non esiste', async () => {
      db.advertisements.findFirst.mockResolvedValue(null);

      await expect(
        service.createVariant('non-existent-ad', companyA, createVariantDto),
      ).rejects.toThrow(NotFoundException);

      expect(llmService.generateAdvertisement).not.toHaveBeenCalled();
      expect(db.advertisement_variants.create).not.toHaveBeenCalled();
    });

    it('dovrebbe lanciare NotFoundException in caso di accesso cross-tenant per advertisement', async () => {
      db.advertisements.findFirst.mockResolvedValue(null);

      await expect(
        service.createVariant(adId, companyB, createVariantDto),
      ).rejects.toThrow(NotFoundException);

      expect(db.advertisements.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: adId,
            job_offers: {
              company_id: companyB,
            },
          },
        }),
      );
      expect(llmService.generateAdvertisement).not.toHaveBeenCalled();
      expect(db.advertisement_variants.create).not.toHaveBeenCalled();
    });

    it('dovrebbe lanciare BadGatewayException e non creare varianti se LLM fallisce', async () => {
      db.advertisements.findFirst.mockResolvedValue({
        id: adId,
        channel: channel_type.INSTAGRAM,
        format: format_type.STORY,
        target_location: 'Milano (Ibrido)',
        job_offers: {
          id: jobOfferId,
          title: 'Senior Frontend Engineer',
          description: 'Descrizione job',
          requirements: 'Requisiti job',
          default_location: 'Milano (Ibrido)',
        },
        advertisement_variants: [{ id: variantId }],
      });

      llmService.generateAdvertisement.mockRejectedValue(
        new Error('API Timeout LLM'),
      );

      await expect(
        service.createVariant(adId, companyA, createVariantDto),
      ).rejects.toThrow(BadGatewayException);

      expect(db.advertisement_variants.create).not.toHaveBeenCalled();
    });
  });

  describe('updateVariant (Step 9.6)', () => {
    const existingVariant = {
      id: variantId,
      advertisement_id: adId,
      variant_name: 'Variante 1',
      headline: 'Headline Originale',
      body_text: 'Body Originale',
      call_to_action: 'CTA Originale',
      creative_notes: 'Note Originali',
      generated_headline: 'Headline Originale',
      generated_body: 'Body Originale',
      generated_cta: 'CTA Originale',
      is_edited: false,
      is_selected: false,
      created_at: new Date('2026-10-04T05:48:55.761Z'),
      updated_at: new Date('2026-10-04T05:48:55.761Z'),
    };

    it('dovrebbe aggiornare la headline, impostare is_edited=true e mantenere invariati i campi generated_*', async () => {
      db.advertisement_variants.findFirst.mockResolvedValue(existingVariant);
      db.advertisement_variants.update.mockResolvedValue({
        ...existingVariant,
        headline: 'Headline Modificata dall Utente',
        is_edited: true,
        updated_at: new Date('2026-10-04T06:10:00.000Z'),
      });

      const result = await service.updateVariant(adId, variantId, companyA, {
        headline: 'Headline Modificata dall Utente',
      });

      // 1. Verifica query scoped su variantId, adId e companyId
      expect(db.advertisement_variants.findFirst).toHaveBeenCalledWith({
        where: {
          id: variantId,
          advertisement_id: adId,
          advertisements: {
            job_offers: {
              company_id: companyA,
            },
          },
        },
      });

      // 2. Verifica che Prisma aggiorni solo i campi editabili con is_edited calcolato a true
      expect(db.advertisement_variants.update).toHaveBeenCalledWith({
        where: { id: variantId },
        data: {
          headline: 'Headline Modificata dall Utente',
          body_text: existingVariant.body_text,
          call_to_action: existingVariant.call_to_action,
          creative_notes: existingVariant.creative_notes,
          is_edited: true,
        },
      });

      // 3. I campi generated_* rimangono intatti
      expect(result.headline).toBe('Headline Modificata dall Utente');
      expect(result.generatedHeadline).toBe(existingVariant.generated_headline);
      expect(result.isEdited).toBe(true);
    });

    it('dovrebbe ricalcolare is_edited=false se l utente ripristina i valori originali generati', async () => {
      const alreadyEditedVariant = {
        ...existingVariant,
        headline: 'Testo Modificato Precedentemente',
        is_edited: true,
      };

      db.advertisement_variants.findFirst.mockResolvedValue(alreadyEditedVariant);
      db.advertisement_variants.update.mockResolvedValue({
        ...alreadyEditedVariant,
        headline: existingVariant.generated_headline,
        is_edited: false,
      });

      const result = await service.updateVariant(adId, variantId, companyA, {
        headline: existingVariant.generated_headline,
      });

      expect(db.advertisement_variants.update).toHaveBeenCalledWith({
        where: { id: variantId },
        data: expect.objectContaining({
          headline: existingVariant.generated_headline,
          is_edited: false,
        }),
      });

      expect(result.isEdited).toBe(false);
    });

    it('dovrebbe lanciare BadRequestException se il payload di aggiornamento è vuoto', async () => {
      await expect(
        service.updateVariant(adId, variantId, companyA, {}),
      ).rejects.toThrow(BadRequestException);

      expect(db.advertisement_variants.findFirst).not.toHaveBeenCalled();
      expect(db.advertisement_variants.update).not.toHaveBeenCalled();
    });

    it('dovrebbe lanciare NotFoundException se la variante non appartiene all annuncio specificato', async () => {
      db.advertisement_variants.findFirst.mockResolvedValue(null);

      await expect(
        service.updateVariant('different-ad-id', variantId, companyA, {
          headline: 'Nuova Headline',
        }),
      ).rejects.toThrow(NotFoundException);

      expect(db.advertisement_variants.update).not.toHaveBeenCalled();
    });

    it('dovrebbe lanciare NotFoundException in caso di accesso cross-tenant', async () => {
      db.advertisement_variants.findFirst.mockResolvedValue(null);

      await expect(
        service.updateVariant(adId, variantId, companyB, {
          headline: 'Nuova Headline',
        }),
      ).rejects.toThrow(NotFoundException);

      expect(db.advertisement_variants.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: variantId,
            advertisement_id: adId,
            advertisements: {
              job_offers: {
                company_id: companyB,
              },
            },
          },
        }),
      );
      expect(db.advertisement_variants.update).not.toHaveBeenCalled();
    });
  });
});