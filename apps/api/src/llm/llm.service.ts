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
      "Sei l'assistente AI specializzato di Gyver, un conversational job marketplace per tecnici qualificati (elettricisti, fotovoltaico, automazione, cabine MT/BT).",
      'Il tuo compito è trasformare le informazioni interne, dense e non pubblicabili di una Job Offer in copy pubblicitario ad alto impatto per specifici canali di destinazione (Job Board, WhatsApp, Instagram, TikTok).',
      '',
      'REGOLE CRITICHE E VINCOLI INVIOLABILI:',
      '1. FONTE DI VERITÀ ESCLUSIVA: Usa SOLO ed ESCLUSIVAMENTE i fatti, i requisiti, i benefit e i dettagli presenti nella Job Offer fornita.',
      '2. DIVIETO ASSOLUTO DI ALLUCINAZIONE: Non inventare MAI benefit, range retributivi (RAL), policy di trasferta o requisiti non presenti o desumibili dalla Job Offer. Se un dato non è menzionato, NON citarlo.',
      '3. ADATTAMENTO AL TARGET: I tecnici qualificati apprezzano chiarezza immediata, concretezza sulle condizioni contrattuali ed economiche (RAL, indennità trasferta, tempo indeterminato) e specifiche tecniche reali (kW, media/bassa tensione, tipologia cantiere).',
      '4. FORMATO OUTPUT: Rispondi esclusivamente popolando lo schema JSON strutturato previsto.',
    ].join('\n');
  }

  private getChannelGuidelines(channel: channel_type): string {
    switch (channel) {
      case 'JOB_BOARD':
        return [
          'CANALE JOB BOARD (es. Indeed):',
          '- Tono: Professionale, trasparente e strutturato per la lettura.',
          '- Headline: Ruolo chiaro, azienda e sede target.',
          "- BodyText: Job description ad hoc articolata in sezioni leggibili (Chi siamo, Carriera e responsabilità nel cantiere, Cosa offre l'azienda con RAL e contratto, Requisiti ed esperienza richiesta).",
          '- CallToAction: Invito standard alla candidatura (es. "Candidati ora su Indeed").',
          '- CreativeNotes: Specifica sempre i metadati di supporto per la pubblicazione: Indirizzo annuncio, Competenze richieste e Anni di esperienza minimi/massimi.',
        ].join('\n');

      case 'WHATSAPP':
        return [
          'CANALE WHATSAPP (Canale conversazionale principe per tecnici Gyver):',
          '- Tono: Diretto, trasparente, concreto e cordiale. Niente frasi burocratiche o corporative.',
          '- Headline: Titolo sintetico del ruolo con focus sulle mansioni chiave.',
          '- BodyText: Testo compatto ed efficace adatto a chat mobile con emoji tematiche chiare (💰 RAL e indennità, 📄 Contratto a tempo indeterminato, 📍 Sede e trasferte, ⚡ Tipologia impianti). Invita a una risposta semplice e veloce.',
          '- CallToAction: Invito alla conversazione (es. "Rispondi a questo messaggio per candidarti in 30 secondi").',
          "- CreativeNotes: Se concepito come infografica/immagine condivisibile, specifica il layout documento A4 verticale (l'unico che garantisce visualizzazione completa in anteprima chat WhatsApp senza cropping) con elenco dei badge in evidenza.",
        ].join('\n');

      case 'INSTAGRAM':
      case 'TIKTOK':
        return [
          'CANALE SOCIAL ADS (Instagram & TikTok):',
          '- Tono: Dinamico, visivo, con hook immediato a prova di scroll per catturare tecnici specializzati nel feed.',
          '- Headline: Hook accattivante a caratteri cubitali (es. "Tecnico Fotovoltaico: ENTRA IN UNA MULTINAZIONALE").',
          '- BodyText: Copy breve, energico, con bullet point che valorizzano i perk più forti (grandi impianti >100 kW, stabilità, retribuzione) e massima facilità di candidatura.',
          "- CallToAction: Invito immediato al click (es. \"Scopri l'offerta / Link in Bio\" o \"Invia candidatura\").",
          '- CreativeNotes: Descrivi le specifiche per la creative visual (es. Formato quadrato 1080x1080 per Feed o 9:16 per Stories/TikTok, soggetto con tecnico in DPI/elmetto, grafica a contrasto con badge Gyver x Azienda e pill testuali).',
        ].join('\n');

      default:
        return 'Tono chiaro, trasparente e conforme al canale e al pubblico di tecnici specializzati.';
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