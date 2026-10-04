# Gyver — Sezione Annunci (Delivery Team)

Nucleo applicativo per il team di Delivery di Gyver: piattaforma per trasformare offerte di lavoro dense e interne in annunci pubblicitari multicanale (Job Board, WhatsApp, Instagram, TikTok) tramite LLM con Structured Outputs, generazione di varianti e modifica manuale con persistenza dello storico originale.

---

## 🏗️ Struttura della Repository

Il repository è strutturato come monorepo leggero:

```text
gyver/
├── apps/
│   ├── api/             # Backend NestJS (REST API, Prisma ORM, modulo LLM OpenAI)
│   └── web/             # Frontend Next.js (App Router, Tailwind CSS, interfaccia Delivery)
├── docs/
│   └── migrations/      # Script SQL DDL di schema, migrazioni e seed
├── architecture.md      # Documentazione architetturale e modello dati
├── prompts.md           # Specifiche e guardrail del workflow LLM
├── ai-workflows.md      # Metodologia di sviluppo assistita da AI
└── tradeoffs.md         # Registro delle decisioni architetturali e tradeoff
```

---

## ⚙️ Prerequisiti e Variabili d'Ambiente

### Prerequisiti
* **Node.js**: >= 20.x
* **npm**: >= 10.x
* **PostgreSQL** (locale o istanza gestita Supabase)
* **OpenAI API Key**: chiave con accesso a modelli che supportano Structured Outputs (`gpt-4o-mini` o `gpt-4o`)

---

### 1. Configurazione Backend (`apps/api/.env`)

Crea il file `apps/api/.env` (puoi basarti su `apps/api/.env.example`):

```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
OPENAI_API_KEY="sk-proj-..."
```

> **Nota sulle connessioni PostgreSQL**: `DATABASE_URL` è usata per il connection pooling dell'applicazione, mentre `DIRECT_URL` è impiegata dallo script di seed per le query DDL dirette.

---

### 2. Configurazione Frontend (`apps/web/.env`)

Crea il file `apps/web/.env` (puoi basarti su `apps/web/.env.example`):

```env
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_DEFAULT_COMPANY_ID=a0000000-0000-0000-0000-000000000001
```

---

## 🚀 Installazione e Avvio Rapido

### 1. Installazione delle dipendenze

Dalla root del repository:

```bash
# Dipendenze Backend (NestJS + Prisma + OpenAI)
cd apps/api
npm install

# Dipendenze Frontend (Next.js + Tailwind CSS)
cd ../web
npm install
```

---

### 2. Configurazione Database, Migrazioni e Seed

Dalla cartella `apps/api`, esegui lo script di popolamento automatico. Lo script esegue in sequenza la DDL dello schema, l'ownership multi-tenant e i dati seed ufficiali (Job Offer per Tecnico Elettricista Fotovoltaico AB Group SpA e 3 annunci pre-popolati):

```bash
cd apps/api
npm run db:seed
```

*(Opzionale) In alternativa manuale con client `psql`:*
```bash
psql $DIRECT_URL -f ../../docs/migrations/001_initial_schema.sql
psql $DIRECT_URL -f ../../docs/migrations/005_add_company_ownership.sql
psql $DIRECT_URL -f ../../docs/migrations/002_seed_job_offer.sql
psql $DIRECT_URL -f ../../docs/migrations/003_seed_advertisements.sql
```

---

### 3. Avvio delle Applicazioni

Apri due terminali distinti:

```bash
# Terminale 1: Backend API (Porta 3001)
cd apps/api
npm run start:dev
```

```bash
# Terminale 2: Frontend Web (Porta 3000)
cd apps/web
npm run dev
```

* **Frontend UI**: [http://localhost:3000](http://localhost:3000)
* **Backend API REST**: [http://localhost:3001](http://localhost:3001)

---

## 🚶‍♂️ Percorso Rapido di Test End-to-End

Segui questo percorso per verificare l'intero ciclo di vita dell'applicazione:

1. **Configura e avvia database e API**: completa seed e avvio di `apps/api` (porta 3001).
2. **Avvia il frontend**: avvia `apps/web` (porta 3000) e visita `http://localhost:3000`.
3. **Apri la lista annunci**: nella dashboard iniziale visualizzi i 3 annunci precaricati (Job Board, WhatsApp, Instagram/TikTok). Puoi testare i filtri dinamici per canale e per Job Offer.
4. **Crea un nuovo Advertisement**:
   * Clicca su **"+ Nuovo Annuncio"** in alto a destra.
   * Seleziona la Job Offer *Tecnico elettricista fotovoltaico - AB Group SpA*.
   * Seleziona un canale (es. `WHATSAPP` o `TIKTOK`).
   * (Opzionale) Imposta sede target e indicazioni per la prima variante (es. *"Enfatizza RAL 38.000€ e tempo indeterminato"*).
   * Clicca su **"Genera Annuncio"**: il backend invoca l'LLM con schema strict OpenAI, persiste la transazione atomica (annuncio + prima variante) e reindirizza al dettaglio.
5. **Genera una nuova Variant (AI)**:
   * Nel dettaglio dell'annuncio, premi **"+ Genera Nuova Variante (AI)"**.
   * Inserisci un nuovo angolo comunicativo (es. *"Focus su crescita rapida a Capo Squadra e trasferte con indennità"*).
   * L'AI genera una variante aggiuntiva coerente con il canale, convalidata e persistita sul database.
6. **Modifica manuale della Variant**:
   * Clicca su **"Modifica"** sulla card di una variante.
   * Modifica a piacimento Titolo, Testo, Call to Action o Note Creative.
   * Clicca **"Salva Modifiche"**: la variante viene marcata come `Modificata` (`is_edited: true`), ma i campi `generated_headline`, `generated_body` e `generated_cta` restano intatti nel database a fini di tracciamento e audit.

---

## 🧪 Esempi di Chiamate API (cURL)

Il backend valida l'ownership multi-tenant tramite l'header obbligatorio `x-company-id`.

### 1. Elenco Annunci con Filtri
```bash
curl -X GET "http://localhost:3001/advertisements?channel=WHATSAPP" \
  -H "x-company-id: a0000000-0000-0000-0000-000000000001"
```

### 2. Creazione Annuncio + Variante Iniziale via LLM
```bash
curl -X POST "http://localhost:3001/advertisements" \
  -H "Content-Type: application/json" \
  -H "x-company-id: a0000000-0000-0000-0000-000000000001" \
  -d '{
    "jobOfferId": "00000000-0000-0000-0000-000000000001",
    "channel": "WHATSAPP",
    "format": "MESSAGE",
    "targetLocation": "Orzinuovi (BS) + trasferte Nord Italia",
    "variantGoals": "Enfasi su tempo indeterminato, RAL fino a 38k e ticket ristorante"
  }'
```

### 3. Generazione di una Variante Aggiuntiva
```bash
curl -X POST "http://localhost:3001/advertisements/<ADVERTISEMENT_ID>/variants" \
  -H "Content-Type: application/json" \
  -H "x-company-id: a0000000-0000-0000-0000-000000000001" \
  -d '{
    "variantGoals": "Target giovani tecnici: focus su affiancamento, corsi PES/PAV e crescita professionale"
  }'
```

### 4. Modifica Manuale di una Variante
```bash
curl -X PATCH "http://localhost:3001/advertisements/<ADVERTISEMENT_ID>/variants/<VARIANT_ID>" \
  -H "Content-Type: application/json" \
  -H "x-company-id: a0000000-0000-0000-0000-000000000001" \
  -d '{
    "headline": "Tecnico Fotovoltaico Specializzato — Inserimento Diretto",
    "callToAction": "Rispondi su WhatsApp con CV o lista esperienze"
  }'
```
