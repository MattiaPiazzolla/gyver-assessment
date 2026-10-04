import { AdvertisementsController } from './advertisements.controller';
import { AdvertisementsService } from './advertisements.service';
import {
  BadGatewayException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { channel_type, format_type, ad_status } from '@prisma/client';
import { jest } from '@jest/globals';

describe('AdvertisementsController (Step 9.7)', () => {
  let controller: AdvertisementsController;
  let service: {
    create: jest.Mock;
    createVariant: jest.Mock;
    updateVariant: jest.Mock;
    findAllByCompany: jest.Mock;
    findOneByCompany: jest.Mock;
  };

  const companyId = 'a0000000-0000-0000-0000-000000000001';
  const adId = 'ccb6ae21-561d-402f-acb6-40e5e18d4460';
  const variantId = '643c9f3f-eadd-4de4-aeeb-37b870c2c686';
  const jobOfferId = '00000000-0000-0000-0000-000000000001';

  beforeEach(() => {
    service = {
      create: jest.fn(),
      createVariant: jest.fn(),
      updateVariant: jest.fn(),
      findAllByCompany: jest.fn(),
      findOneByCompany: jest.fn(),
    };

    controller = new AdvertisementsController(
      service as unknown as AdvertisementsService,
    );
  });

  describe('Controllo Header Multi-tenant x-company-id', () => {
    it('dovrebbe lanciare UnauthorizedException su create se header manca', async () => {
      await expect(
        controller.create('' as any, {
          jobOfferId,
          channel: channel_type.INSTAGRAM,
          format: format_type.STORY,
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(service.create).not.toHaveBeenCalled();
    });

    it('dovrebbe lanciare UnauthorizedException su createVariant se header manca', async () => {
      await expect(
        controller.createVariant('' as any, adId, {}),
      ).rejects.toThrow(UnauthorizedException);
      expect(service.createVariant).not.toHaveBeenCalled();
    });

    it('dovrebbe lanciare UnauthorizedException su updateVariant se header manca', async () => {
      await expect(
        controller.updateVariant('' as any, { advertisementId: adId, variantId }, {
          headline: 'Nuova headline',
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(service.updateVariant).not.toHaveBeenCalled();
    });

    it('dovrebbe lanciare UnauthorizedException su findAll se header manca', async () => {
      await expect(
        controller.findAll('' as any, {}),
      ).rejects.toThrow(UnauthorizedException);
      expect(service.findAllByCompany).not.toHaveBeenCalled();
    });

    it('dovrebbe lanciare UnauthorizedException su findOne se header manca', async () => {
      await expect(
        controller.findOne('' as any, adId),
      ).rejects.toThrow(UnauthorizedException);
      expect(service.findOneByCompany).not.toHaveBeenCalled();
    });
  });

  describe('Inoltro a Service e Gestione Response', () => {
    it('dovrebbe invocare service.create con parametri corretti', async () => {
      const dto = {
        jobOfferId,
        channel: channel_type.INSTAGRAM,
        format: format_type.STORY,
        targetLocation: 'Torino',
      };
      const mockResult = { id: adId };
      service.create.mockResolvedValue(mockResult);

      const result = await controller.create(companyId, dto);

      expect(service.create).toHaveBeenCalledWith(companyId, dto);
      expect(result).toBe(mockResult);
    });

    it('dovrebbe propagare NotFoundException se Job Offer non trovata in create', async () => {
      service.create.mockRejectedValue(
        new NotFoundException('Offerta di lavoro non trovata'),
      );

      await expect(
        controller.create(companyId, {
          jobOfferId,
          channel: channel_type.INSTAGRAM,
          format: format_type.STORY,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('dovrebbe propagare BadGatewayException se LLM fallisce in create', async () => {
      service.create.mockRejectedValue(
        new BadGatewayException('Impossibile generare con provider AI'),
      );

      await expect(
        controller.create(companyId, {
          jobOfferId,
          channel: channel_type.INSTAGRAM,
          format: format_type.STORY,
        }),
      ).rejects.toThrow(BadGatewayException);
    });

    it('dovrebbe invocare service.findAllByCompany con query params', async () => {
      const query = { channel: channel_type.INSTAGRAM };
      service.findAllByCompany.mockResolvedValue([]);

      const result = await controller.findAll(companyId, query);

      expect(service.findAllByCompany).toHaveBeenCalledWith(companyId, query);
      expect(result).toEqual([]);
    });

    it('dovrebbe invocare service.findOneByCompany con id e companyId', async () => {
      const mockAd = { id: adId, status: ad_status.DRAFT };
      service.findOneByCompany.mockResolvedValue(mockAd);

      const result = await controller.findOne(companyId, adId);

      expect(service.findOneByCompany).toHaveBeenCalledWith(adId, companyId);
      expect(result).toEqual(mockAd);
    });

    it('dovrebbe invocare service.updateVariant spacchettando params', async () => {
      const updateDto = { headline: 'Nuova Headline' };
      const mockUpdated = { id: variantId, headline: 'Nuova Headline' };
      service.updateVariant.mockResolvedValue(mockUpdated);

      const result = await controller.updateVariant(
        companyId,
        { advertisementId: adId, variantId },
        updateDto,
      );

      expect(service.updateVariant).toHaveBeenCalledWith(
        adId,
        variantId,
        companyId,
        updateDto,
      );
      expect(result).toEqual(mockUpdated);
    });
  });
});