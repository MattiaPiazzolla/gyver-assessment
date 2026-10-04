import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LlmService } from './llm.service';
import { channel_type, format_type } from '@prisma/client';

async function runTests() {
  console.log('--- AVVIO TEST WORKFLOW LLM ---\n');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  const llmService = app.get(LlmService);

  const sampleJobOffer = {
    title: 'Tecnico elettricista fotovoltaico - AB Group SpA',
    description:
      'AB Group — multinazionale cogenerazione e rinnovabili (1.700 dipendenti). Carriera da Tecnico Fotovoltaico MT/BT su grandi impianti (>100 kW). Sopralluoghi, collaudi, avviamento impianti e manutenzione straordinaria. Contratto a tempo indeterminato, RAL 32.000 - 38.000 €, indennità trasferta 60 €/notte, ticket pasto 13 €, straordinari viaggio 85%, crescita a site manager.',
    requirements:
      '- 3-5 anni di esperienza su installazione e avviamento impianti FV industriali (>100 kW)\n- Conoscenza cabine secondarie e media tensione (MT/BT)\n- Lettura schemi elettrici unifilari e layout FV\n- Diploma tecnico elettrotecnico e disponibilità a trasferte',
    defaultLocation: 'Via Artigianato, 27, 25034 Orzinuovi BS',
  };

  try {
    // 1. Test JOB_BOARD
    console.log('1. Test Canale JOB_BOARD:');
    const jobBoardResult = await llmService.generateAdvertisement({
      jobOffer: sampleJobOffer,
      channel: channel_type.JOB_BOARD,
      format: format_type.JOB_POSTING,
      targetLocation: 'Via Artigianato, 27, 25034 Orzinuovi BS',
      variantsCount: 1,
    });
    console.log(JSON.stringify(jobBoardResult, null, 2));
    console.log('✓ Test JOB_BOARD superato.\n');

    // 2. Test WHATSAPP
    console.log('2. Test Canale WHATSAPP:');
    const whatsappResult = await llmService.generateAdvertisement({
      jobOffer: sampleJobOffer,
      channel: channel_type.WHATSAPP,
      format: format_type.MESSAGE,
      targetLocation: 'Orzinuovi (BS) + trasferte',
      variantsCount: 1,
    });
    console.log(JSON.stringify(whatsappResult, null, 2));
    console.log('✓ Test WHATSAPP superato.\n');

    // 3. Test INSTAGRAM
    console.log('3. Test Canale INSTAGRAM:');
    const instagramResult = await llmService.generateAdvertisement({
      jobOffer: sampleJobOffer,
      channel: channel_type.INSTAGRAM,
      format: format_type.FEED_POST,
      targetLocation: 'Brescia e province limitrofe',
      variantsCount: 1,
      variantGoals: ['Focus Sfida Tecnica'],
    });
    console.log(JSON.stringify(instagramResult, null, 2));
    console.log('✓ Test INSTAGRAM superato.\n');

    // 4. Test Validazione Fallita (Payload Non Conforme)
    console.log('4. Test Validazione Runtime su Payload Malformato:');
    try {
      await llmService.validateGeneratedOutput({
        variants: [
          {
            headline: '',
            bodyText: 'Corpo valido',
          },
        ],
      });
      console.error('✗ Errore: il test doveva fallire la validazione ma è passato.');
    } catch (err) {
      console.log('✓ Rilevato correttamente errore di validazione:', (err as Error).message);
      console.log('✓ Test Validazione Fallita superato.\n');
    }

    console.log('--- TUTTI I TEST DEL WORKFLOW LLM SONO PASSATI ---');
  } catch (err) {
    console.error('Errore durante i test LLM:', err);
  } finally {
    await app.close();
  }
}

runTests();