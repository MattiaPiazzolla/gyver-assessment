import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

async function runSeed() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('ERRORE: DATABASE_URL o DIRECT_URL non trovata nelle variabili d\'ambiente.');
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connesso al database PostgreSQL per il seeding.');

  const migrationsDir = path.resolve(__dirname, '../../../../docs/migrations');
  const migrationFiles = [
    '001_initial_schema.sql',
    '005_add_company_ownership.sql',
    '002_seed_job_offer.sql',
    '003_seed_advertisements.sql',
  ];

  try {
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`Esecuzione ${file}...`);
        const sql = fs.readFileSync(filePath, 'utf-8');
        await client.query(sql);
        console.log(`Completato ${file}`);
      } else {
        console.warn(`File non trovato: ${filePath}`);
      }
    }
    console.log('Database inizializzato e popolato con successo!');
  } catch (error) {
    console.error('Errore durante l\'esecuzione del seeding:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSeed();
