# Decisioni Tecniche e Tradeoff — Sezione Annunci

Questo documento approfondisce le scelte di design, i compromessi assunti per rispettare il limite di tempo consigliato (circa 4h complessive), l'interpretazione delle ambiguità della traccia e la roadmap evolutiva.

---

## 1. Perché questo Stack e questa Struttura

* **TypeScript End-to-End:** elimina i disallineamenti di modello tra backend e frontend. Condividere la stessa semantica di tipi per canali, formati e stati rende lo sviluppo agile e a prova di refactoring.
* **NestJS (Backend):** architettura solida a moduli, dependency injection chiara, gestione delle eccezioni scalabile e supporto di primo livello a validazione DTO (`class-validator`, `class-transformer`).
* **PostgreSQL + Prisma:** garanzia di integrità relazionale (chiavi esterne con `ON DELETE CASCADE`), migrazioni tracciabili e supporto per query performanti con indici su `channel`, `job_offer_id` e `company_id`.
* **Next.js 15 App Router (Frontend):** server/client components moderni, reattività immediata, tempo di bootstrap minimo con Tailwind CSS per una UI "scrappy ma funzionale" orientata all'efficienza d'uso del Delivery team.

---

## 2. Cosa è Stato Sacrificato per Restare nello Scope

Per non sforare il limite di tempo e concentrarsi sul nucleo del valore richiesto:

1. **Rendering Grafico Diretto delle Immagini:**
   * *Sacrificio:* Non è stato sviluppato un motore di rasterizzazione automatica (es. Canvas, Puppeteer HTML-to-image o modelli diffusion come DALL-E) per esportare direttamente i file PNG/JPEG.
   * *Compromesso adottato:* Il modello AI produce specifiche esecutive dettagliate nel campo `creative_notes` (dimensionamento A4 per WhatsApp o 1080x1080 per social, disposizione dei badge, palette, foto soggetto con DPI). Questo fornisce al designer o a un futuro microservizio di rendering grafico tutto ciò che serve per comporre l'asset.

2. **Autenticazione Utente Completa (AuthN/AuthZ):**
   * *Sacrificio:* Mancano login con sessioni, JWT, refresh token e gestione ruoli (Account Manager vs Admin).
   * *Compromesso adottato:* È stato predisposto il campo multi-tenant `company_id` con fallback automatico a una company predefinita se l'header `x-company-id` non è inviato, permettendo di testare istantaneamente ogni endpoint sia da interfaccia sia via curl.

3. **Integrazione Diretta con API Esterne di Pubblicazione:**
   * *Sacrificio:* Non ci sono connettori attivi per le API di Indeed, WhatsApp Cloud API o Meta Graph API.
   * *Compromesso adottato:* Il sistema si ferma allo stato `DRAFT` / `PUBLISHED` all'interno del database interno di Gyver, pronto per essere consumato da worker di dispatching dedicati.

---

## 3. Interpretazione delle Parti Ambigue della Traccia

* **Formati ("Solo testo", "Solo immagine", "Immagine più testo") vs Posizionamento del Canale:**
  * *Ambiguità:* La traccia elenca come formati *"Solo testo, Solo immagine, Immagine più testo"*, ma poi negli esempi mostra posizionamenti specifici (Job description formattata per Indeed, foglio A4 per WhatsApp, creative 1080x1080 per feed social).
  * *Decisione:* Abbiamo modellato i formati a livello di tipologia di contenuto (`JOB_POSTING`, `MESSAGE`, `FEED_POST`, `STORY`) e associato a ciascun canale la capacità di generare testo puro o layout visivo descritto in `creative_notes`. Questo permette di coprire sia il caso del messaggio chat WhatsApp (testo puro) sia dell'infografica A4 (immagine con badge).

* **Target Location Indipendente dalla Job Offer:**
  * *Ambiguità:* La traccia segnala che *"Gli annunci pubblicati possono riportare luoghi geografici diversi dalla job offer di partenza e possono differire anche tra loro"*.
  * *Decisione:* Abbiamo introdotto su ogni annuncio un campo `target_location` indipendente. Se l'utente non lo specifica, il backend eredita in automatico la `default_location` dell'offerta; se l'utente desidera fare sponsorizzazioni su territori specifici (es. attrarre candidati da Bergamo per un cantiere a Brescia), la sede target dell'annuncio diverge da quella contrattuale della job offer.

* **Job Description Densa vs Annunci Concisi:**
  * *Ambiguità:* La Job Offer fornita condensa dati provenienti da più entità (retribuzione, orari, trasferte, requisiti, cantiere).
  * *Decisione:* Abbiamo strutturato il prompt in modo che l'LLM agisca da "filtro intelligente": estrae solo gli elementi ad alto valore attrattivo per i tecnici (RAL €38k, tempo indeterminato, impianti >100 kW) e scarta il gergo burocratico interno.

---

## 4. Limiti Tecnici della Soluzione

* **Chiamate LLM Sincrone nell'HTTP Request/Response:**
  * La chiamata verso OpenAI avviene all'interno dell'endpoint POST di creazione dell'annuncio. Sebbene `gpt-4o-mini` risponda solitamente in 1.5 - 2.5 secondi, in caso di congestione o retry la richiesta HTTP può prolungarsi fino a 5-6 secondi.
* **Mancanza di Paginazione lato Server:**
  * `GET /advertisements` restituisce attualmente tutti gli annunci della company filtrati per canale/jobOffer ordinati per data discendente. Per dataset con centinaia di annunci sarà necessaria paginazione cursor-based o limit/offset.

---

## 5. Cosa Farei con 1 Giorno in Più (in Ordine di Priorità)

1. **Rendering Automatico delle Grafiche (HTML/Canvas to Image):**
   * Creare un endpoint (es. via Satori o `@sparticuz/chromium`) per compilare direttamente il file immagine A4 di WhatsApp e il formato 1080x1080 Instagram/TikTok, partendo dai badge e dai copy generati dall'LLM, salvando l'asset su storage S3/Supabase.
2. **Coda Asincrona di Elaborazione (BullMQ / Redis):**
   * Spostare la generazione delle varianti in un job background asincrono con WebSocket / Server-Sent Events (SSE) per notificare la UI in tempo reale, azzerando il tempo di blocco della richiesta HTTP.
3. **Pulsante di Rigenerazione Variante con Feedback Naturale:**
   * Aggiungere nella UI la possibilità di rigenerare una variante esistente fornendo un'istruzione correttiva in linguaggio naturale (es. *"Rendilo più corto e metti in risalto i buoni pasto"*).
4. **Esportazione / Copia con 1 Click per i Canali:**
   * Aggiungere nel frontend i pulsanti *"Copia per WhatsApp"* (con testo e formattazione markdown già pronta per l'incolla in chat) ed esportazione testo per Indeed.
