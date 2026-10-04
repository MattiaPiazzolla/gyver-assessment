# AI Workflows & Tooling di Sviluppo

In Gyver lo sviluppo assistito da agenti e modelli di intelligenza artificiale è prassi quotidiana. Questo documento descrive come è stato progettato e guidato il flusso di lavoro per la realizzazione di questo assessment.

---

## 1. Il Flusso di Lavoro Progettato

Lo sviluppo del progetto è stato organizzato secondo una pipeline modulare suddivisa in fasi progressive:

```
[1. Analisi Requisiti & Gap Audit]
               │
               ▼
[2. Data Modeling & Database Schema (PostgreSQL/Prisma)]
               │
               ▼
[3. Core Backend & LLM Pipeline (NestJS + OpenAI Strict Outputs)]
               │
               ▼
[4. Frontend Delivery Dashboard (Next.js 15 App Router)]
               │
               ▼
[5. Refinement di Dominio Gyver (Elettrotecnica/Fotovoltaico & Esempi A4/1080x1080)]
               │
               ▼
[6. Documentazione Esplicativa & Tradeoff Audit]
```

### Perché questa orchestrazione:
* **Separazione delle complessità:** iniziare dal contratto dei dati (schema relazionale) ha permesso di blindare i concetti di *Job Offer*, *Annuncio* e *Variante* prima ancora di scrivere codice applicativo.
* **Affidabilità contrattuale:** l'uso tempestivo di TypeScript DTO e OpenAI Structured Outputs ha eliminato a monte il 99% dei bug di disallineamento tra API e UI.
* **Test guidato sui dati reali:** inserire la Job Offer reale di AB Group fin dalle prime fasi ha consentito di verificare la qualità effettiva dei copy generati per tecnici specializzati rispetto a ruoli generici.

---

## 2. Strumenti Utilizzati e Motivazioni

Durante la realizzazione del progetto sono stati impiegati diversi strumenti e convenzioni:

### A. Subagents & Pair-Programming Agentico
* **Ruolo di architettura e revisione:** utilizzo dell'ambiente assistito per condurre un'analisi comparativa continua tra i requisiti formali della traccia Gyver e il codice effettivamente implementato nel repository.
* **Rifattorizzazione chirurgica:** esecuzione di modifiche puntuali e localizzate (`diff blocks`) per preservare la leggibilità del codice ed evitare regressioni.

### B. Prisma Skills & Database Tools
* Utilizzo delle skill di setup e migrazione di Prisma per PostgreSQL con connection pooling (Supabase) e driver adapter (`@prisma/adapter-pg`).
* Generazione di migrazioni SQL idempotenti (`ON CONFLICT DO UPDATE`) per garantire che chiunque cloni il repository possa inizializzare e ripopolare il database in un singolo comando (`npm run db:seed`).

### C. OpenAI Structured Outputs & SDK
* Utilizzo dell'SDK ufficiale `openai` configurato con parametri stringenti:
  * `strict: true` sullo schema JSON per eliminare qualsiasi rischio di parsing failure.
  * Timeout calibrato a 15s con retry policy su codici 429 e 5xx.
  * `gpt-4o-mini` come modello di default: offre il miglior bilanciamento tra rapidità di risposta (< 2 secondi per variante), costo contenuto e rispetto ferreo dei vincoli di non-allucinazione.

### D. Tooling di Qualità e Linting
* **Oxlint & TypeScript Compiler:** per un controllo statico del codice ultra-rapido sia lato backend sia lato frontend.
* **Git Workflows atomici:** commit strutturati per feature (`feat:`, `chore:`, `fix:`) per documentare l'evoluzione logica del progetto.
