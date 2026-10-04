import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  Optional,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { channel_type } from '@prisma/client';
import { GenerateAdvertisementInput } from './dto/generate-advertisement-input.dto';
import { GeneratedAdvertisementOutputDto } from './dto/generated-advertisement-output.dto';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly openai: OpenAI;
  private readonly model = 'gpt-4o-mini';
  private readonly maxRetries = 2;
  private readonly timeoutMs = 15000;

  constructor(
    @Optional() private readonly configService?: ConfigService,
  ) {
    const apiKey =
      this.configService?.get<string>('OPENAI_API_KEY') ||
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      this.logger.warn("OPENAI_API_KEY non trovata nelle variabili d'ambiente.");
    }

    this.openai = new OpenAI({
      apiKey: apiKey || '',
      timeout: this.timeoutMs,
      maxRetries: 0,
    });
  }

  private buildSystemPrompt(): string {
    return [
      'Sei un esperto copywriter specializzato in annunci di lavoro e recruitment marketing per piattaforme digitali.',
      'Il tuo compito è trasformare le informazioni di una Job Offer interna in copy promozionale per specifici canali di comunicazione.',
      '',
      'REGOLE CRITICHE E VINCOLI INVIOLABILI:',
      '1. FONTE DI VERITÀ ESCLUSIVA: Usa SOLO ed ESCLUSIVAMENTE i fatti, i requisiti e i dettagli presenti nella Job Offer fornita.',
      "2. DIVIETO ASSOLUTO DI INVENZIONE: Non inventare MAI benefit, range retributivi (RAL), policy di lavoro (remoto/presenza), tecnologie o requisiti non esplicitamente menzionati nell'input. Se un dato non è presente, NON menzionarlo.",
      "3. ADATTAMENTO: Il tuo valore consiste nel riorganizzare, sintetizzare e modulare il tono di voce in funzione del canale e del formato richiesti, NON nell'arricchire arbitrariamente le informazioni.",
      '4. LINGUA: Mantieni la stessa lingua principale della Job Offer.',
      '5. FORMATO OUTPUT: Rispondi esclusivamente popolando lo schema JSON strutturato fornito.',
    ].join('\n');
  }

  private getChannelGuidelines(channel: channel_type): string {
    switch (channel) {
      case 'JOB_BOARD':
        return 'Tono professionale, chiaro e strutturato. Headline formale con ruolo e sede. Body ben articolato con focus su responsabilità e requisiti essenziali. CTA orientata alla candidatura standard. CreativeNotes: eventuali note sobrie per intestazione aziendale.';
      case 'WHATSAPP':
        return 'Tono diretto, personale e colloquiale ma rispettoso. Headline breve. Body sintetico di 3-5 righe adatto a messaggio chat mobile, con emoji sobrie. CTA immediata che invita alla risposta o invio CV. CreativeNotes: inserire "Nessun elemento grafico (messaggio testuale)".';
      case 'INSTAGRAM':
      case 'TIKTOK':
        return 'Tono dinamico, accattivante e orientato al pubblico social. Headline con hook nei primi secondi. Body compatto a prova di scroll con hashtag pertinenti alle sole tecnologie citate. CTA per link in bio o swipe up. CreativeNotes: dettagli visivi sul visual, layout o testo in sovrimpressione.';
      default:
        return 'Tono chiaro e professionale conforme al canale.';
    }
  }

  private buildUserPrompt(input: GenerateAdvertisementInput): string {
    const {
      jobOffer,
      channel,
      format,
      targetLocation,
      variantsCount = 2,
      variantGoals = [],
    } = input;
    const channelGuidelines = this.getChannelGuidelines(channel);

    return [
      'DATI DELLA JOB OFFER (Fonte di verità):',
      `- Titolo: ${jobOffer.title}`,
      `- Descrizione: ${jobOffer.description}`,
      `- Requisiti: ${jobOffer.requirements}`,
      `- Sede predefinita: ${jobOffer.defaultLocation}`,
      '',
      "CONTESTO DELL'ANNUNCIO:",
      `- Canale: ${channel}`,
      `- Formato: ${format}`,
      `- Sede target per questo annuncio: ${targetLocation}`,
      `- Numero di varianti richieste: ${variantsCount}`,
      variantGoals.length > 0
        ? `- Obiettivi specifici per variante:\n${variantGoals.map((g, i) => `  * Variante ${i + 1}:${g}`).join('\n')}`
        : '',
      '',
      'LINEE GUIDA PER IL CANALE:',
      channelGuidelines,
      '',
      `Genera esattamente ${variantsCount} varianti coerenti, rispettando tutti i vincoli.`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  async validateGeneratedOutput(
    rawPayload: unknown,
  ): Promise<GeneratedAdvertisementOutputDto> {
    const dtoInstance = plainToInstance(
      GeneratedAdvertisementOutputDto,
      rawPayload,
    );
    const errors = await validate(dtoInstance, {
      whitelist: true,
      forbidNonWhitelisted: false,
    });

    if (errors.length > 0) {
      const formattedErrors = errors
        .map((err) => Object.values(err.constraints || {}).join(', '))
        .join('; ');
      this.logger.error(`Output LLM non conforme allo schema: ${formattedErrors}`);
      throw new UnprocessableEntityException(
        `Output del modello LLM non valido: ${formattedErrors}`,
      );
    }

    return dtoInstance;
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429 || (error.status && error.status >= 500)) {
        return true;
      }
      return false;
    }

    if (error instanceof UnprocessableEntityException) {
      return true;
    }

    if (
      error instanceof Error &&
      (error.name === 'APIConnectionTimeoutError' ||
        error.message.includes('timeout'))
    ) {
      return true;
    }

    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async generateAdvertisement(
    input: GenerateAdvertisementInput,
  ): Promise<GeneratedAdvertisementOutputDto> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.openai.chat.completions.create({
          model: this.model,
          messages: [
            { role: 'system', content: this.buildSystemPrompt() },
            { role: 'user', content: this.buildUserPrompt(input) },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'advertisement_generation',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  variants: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        headline: { type: 'string' },
                        bodyText: { type: 'string' },
                        callToAction: { type: 'string' },
                        creativeNotes: { type: 'string' },
                      },
                      required: [
                        'headline',
                        'bodyText',
                        'callToAction',
                        'creativeNotes',
                      ],
                      additionalProperties: false,
                    },
                  },
                },
                required: ['variants'],
                additionalProperties: false,
              },
            },
          },
          temperature: 0.7,
        });

        const rawContent = response.choices[0]?.message?.content;
        if (!rawContent) {
          throw new InternalServerErrorException(
            'Risposta vuota ricevuta dal provider LLM.',
          );
        }

        const parsedJson = JSON.parse(rawContent);
        return await this.validateGeneratedOutput(parsedJson);
      } catch (error) {
        lastError = error;
        const isRetryable = this.isRetryableError(error);

        this.logger.warn(
          `Tentativo ${attempt}/${this.maxRetries} fallito. Errore: ${
            error instanceof Error ? error.message : String(error)
          }. Riprovabile: ${isRetryable}`,
        );

        if (attempt < this.maxRetries && isRetryable) {
          const delay = attempt * 1000;
          await this.sleep(delay);
          continue;
        }

        break;
      }
    }

    if (lastError instanceof OpenAI.APIError) {
      if (lastError.status === 400) {
        throw new BadRequestException(
          `Parametri non validi per il provider LLM: ${lastError.message}`,
        );
      }
      if (lastError.status === 401 || lastError.status === 403) {
        this.logger.error(
          `Autenticazione provider fallita: ${lastError.message}`,
        );
        throw new InternalServerErrorException(
          'Configurazione provider AI non valida o chiave scaduta.',
        );
      }
    }

    if (
      lastError instanceof InternalServerErrorException ||
      lastError instanceof UnprocessableEntityException ||
      lastError instanceof BadRequestException
    ) {
      throw lastError;
    }

    const message =
      lastError instanceof Error ? lastError.message : String(lastError);
    throw new InternalServerErrorException(
      `Errore comunicazione provider LLM dopo retry: ${message}`,
    );
  }
}