# Gyver — Sezione Annunci (Delivery Team)

Soluzione per l'assessment tecnico Gyver: nucleo della sezione Annunci per il team di Delivery per la trasformazione di offerte di lavoro dense in annunci ottimizzati multicanale (Job Board, WhatsApp, Social Ads).

---

## 🏗️ Panoramica Architettura

Il repository è organizzato come monorepo chiaro e modulare:
* **`apps/api`**: Backend in **NestJS** + **Prisma ORM** + **PostgreSQL** + **OpenAI API** (Structured Outputs con schema strict).
* **`apps/web`**: Frontend in **Next.js 15** (App Router) + **Tailwind CSS** per la consultazione, creazione con AI e modifica manuale delle varianti.
* **`docs/migrations`**: Script SQL di schema, migrazioni e seeding contenenti la Job Offer reale dell'assessment e gli annunci di esempio.

---

## ⚙️ Variabili d'Ambiente

### 1. Backend (`apps/api/.env`)
Copia il file di esempio se non presente:
```bash
cp apps/api/.env.example apps/api/.env
```
Variabili richieste:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://utente:password@host:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://utente:password@host:5432/postgres"
OPENAI_API_KEY="sk-proj-..."
```
> **Nota su OpenAI API Key**: Serve una chiave con accesso ai modelli `gpt-4o-mini` o `gpt-4o` con supporto a Structured Outputs (`response_format: json_schema strict`). Ottenibile su [platform.openai.com](https://platform.openai.com).

### 2. Frontend (`apps/web/.env`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_DEFAULT_COMPANY_ID=a0000000-0000-0000-0000-000000000001
```

---

## 🚀 Installazione e Avvio Rapido

### 1. Installazione Dipendenze
Dalla cartella principale del progetto o dalle singole app:
```bash
# Dipendenze Backend
cd apps/api
npm install

# Dipendenze Frontend
cd ../web
npm install
```

### 2. Inizializzazione e Popolamento Database (Seed)
Per applicare le migrazioni SQL e caricare la Job Offer ufficiale (**Tecnico elettricista fotovoltaico - AB Group SpA**) e i 3 annunci pre-popolati con varianti:
```bash
cd apps/api
npm run db:seed
```
*In alternativa*, se preferisci eseguire gli script SQL manualmente tramite `psql`:
```bash
psql $DATABASE_URL -f ../../docs/migrations/001_initial_schema.sql
psql $DATABASE_URL -f ../../docs/migrations/005_add_company_ownership.sql
psql $DATABASE_URL -f ../../docs/migrations/002_seed_job_offer.sql
psql $DATABASE_URL -f ../../docs/migrations/003_seed_advertisements.sql
```

### 3. Avvio Applicazione
In due terminali separati:
```bash
# Terminale 1 — Backend (Porta 3001)
cd apps/api
npm run start:dev

# Terminale 2 — Frontend (Porta 3000)
cd apps/web
npm run dev
```

L'interfaccia web si apre su: **`http://localhost:3000`**  
Le API REST rispondono su: **`http://localhost:3001`**

---

## 🚶‍♂️ Percorso Guidato per Testare il Flusso Completo

1. **Consultazione Annunci Esistenti:**
   * Apri `http://localhost:3000`.
   * Troverai subito i 3 annunci pre-popolati:
     1. **JOB_BOARD (Indeed):** formato solo testo strutturato a sezioni con metadati di sede e competenze.
     2. **WHATSAPP:** copia ottimizzata con badge per anteprima immagine documento A4 e testo per chat.
     3. **INSTAGRAM / TIKTOK:** visual creative 1080x1080 con hook a forte impatto.
   * Utilizza i filtri per testare la ricerca per canale o per Job Offer.

2. **Creazione Nuovo Annuncio con Generazione AI:**
   * Clicca su **"+ Nuovo Annuncio"**.
   * Seleziona la Job Offer *Tecnico elettricista fotovoltaico - AB Group SpA*.
   * Scegli un canale (es. `WHATSAPP` o `TIKTOK`).
   * (Opzionale) Personalizza la sede target (es. *"Brescia e provincia"*) e l'obiettivo (es. *"Enfatizza l'indennità trasferta e i ticket pasto"*).
   * Clicca su **"Genera Annuncio"**: il backend interroga l'LLM, valida la risposta tramite schema strict, persiste l'annuncio e ti reindirizza alla pagina di dettaglio.

3. **Creazione di Ulteriori Varianti:**
   * Nella pagina di dettaglio dell'annuncio appena creato, clicca su **"+ Genera Nuova Variante (AI)"**.
   * Inserisci un angolo diverso (es. *"Focus su crescita rapida a capo cantiere"*).
   * L'AI genererà una nuova variante memorizzandola nel database.

4. **Modifica Manuale (Sovrascrittura):**
   * Accanto a qualsiasi variante, clicca su **"Modifica"**.
   * Modifica il titolo, il testo del body, la CTA o le note creative.
   * Clicca su **"Salva Modifiche"**: il badge passerà da *Originale AI* a *Modificata*, mantenendo salvati nel database sia il testo originale generato sia la versione revisionata a mano.

---

## 🧪 Esempi di Chiamata cURL (Backend API)

Se desideri testare gli endpoint direttamente via riga di comando, passa l'header `x-company-id`:

```bash
# 1. Lista annunci
curl -X GET "http://localhost:3001/advertisements" \
  -H "x-company-id: a0000000-0000-0000-0000-000000000001"

# 2. Creazione annuncio con AI
curl -X POST "http://localhost:3001/advertisements" \
  -H "Content-Type: application/json" \
  -H "x-company-id: a0000000-0000-0000-0000-000000000001" \
  -d '{
    "jobOfferId": "00000000-0000-0000-0000-000000000001",
    "channel": "WHATSAPP",
    "format": "MESSAGE",
    "targetLocation": "Orzinuovi (BS) + trasferte",
    "variantGoals": "Tono diretto ed enfasi su contratto a tempo indeterminato e RAL 38.000€"
  }'
```
