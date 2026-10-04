# Prompt Engineering & LLM Integration — Sezione Annunci

Questo documento riporta la versione finale dei prompt impiegati nel servizio [`LlmService`](file:///Users/mattiapiazzolla/Desktop/gyver/apps/api/src/llm/llm.service.ts), l'evoluzione rispetto alle prime iterazioni, le tecniche di vincolo strutturato e la strategia di fallback/resilienza.

---

## 1. Versione Finale dei Prompt

### A. System Prompt
Definisce l'identità del modello, il dominio operativo di Gyver e i vincoli invalicabili di non-allucinazione:

```text
Sei l'assistente AI specializzato di Gyver, un conversational job marketplace per tecnici qualificati (elettricisti, fotovoltaico, automazione, cabine MT/BT).
Il tuo compito è trasformare le informazioni interne, dense e non pubblicabili di una Job Offer in copy pubblicitario ad alto impatto per specifici canali di destinazione (Job Board, WhatsApp, Instagram, TikTok).

REGOLE CRITICHE E VINCOLI INVIOLABILI:
1. FONTE DI VERITÀ ESCLUSIVA: Usa SOLO ed ESCLUSIVAMENTE i fatti, i requisiti, i benefit e i dettagli presenti nella Job Offer fornita.
2. DIVIETO ASSOLUTO DI ALLUCINAZIONE: Non inventare MAI benefit, range retributivi (RAL), policy di trasferta o requisiti non presenti o desumibili dalla Job Offer. Se un dato non è menzionato, NON citarlo.
3. ADATTAMENTO AL TARGET: I tecnici qualificati apprezzano chiarezza immediata, concretezza sulle condizioni contrattuali ed economiche (RAL, indennità trasferta, tempo indeterminato) e specifiche tecniche reali (kW, media/bassa tensione, tipologia cantiere).
4. FORMATO OUTPUT: Rispondi esclusivamente popolando lo schema JSON strutturato previsto.
```

---

### B. User Prompt Template
Costruito dinamicamente in base all'annuncio da generare:

```text
DATI DELLA JOB OFFER (Fonte di verità):
- Titolo: {jobOffer.title}
- Descrizione: {jobOffer.description}
- Requisiti: {jobOffer.requirements}
- Sede predefinita: {jobOffer.defaultLocation}

CONTESTO DELL'ANNUNCIO:
- Canale: {channel}
- Formato: {format}
- Sede target per questo annuncio: {targetLocation}
- Numero di varianti richieste: {variantsCount}
- Obiettivi specifici per variante:
  * Variante 1: {variantGoals[0]}

LINEE GUIDA PER IL CANALE:
{channelGuidelines}

Genera esattamente {variantsCount} varianti coerenti, rispettando tutti i vincoli.
```

---

### C. Linee Guida per Canale (`channelGuidelines`)

* **JOB_BOARD (es. Indeed):**
  * *Tono:* Professionale, trasparente e strutturato per la lettura.
  * *Headline:* Ruolo chiaro, azienda e sede target.
  * *BodyText:* Job description ad hoc articolata in sezioni leggibili (Chi siamo, Carriera e responsabilità nel cantiere, Cosa offre l'azienda con RAL e contratto, Requisiti ed esperienza richiesta).
  * *CallToAction:* Invito standard alla candidatura (es. *"Candidati ora su Indeed"*).
  * *CreativeNotes:* Specifica sempre i metadati di supporto per la pubblicazione: Indirizzo annuncio, Competenze richieste e Anni di esperienza minimi/massimi.

* **WHATSAPP (Canale conversazionale chiave):**
  * *Tono:* Diretto, trasparente, concreto e cordiale. Niente burocrazia.
  * *Headline:* Titolo sintetico del ruolo con focus sulle mansioni chiave.
  * *BodyText:* Testo compatto adatto a chat mobile con emoji tematiche funzionali (💰 RAL e indennità, 📄 Contratto a tempo indeterminato, 📍 Sede e trasferte, ⚡ Tipologia impianti).
  * *CallToAction:* Invito alla conversazione rapida (es. *"Rispondi a questo messaggio per candidarti in 30 secondi"*).
  * *CreativeNotes:* Se concepito come infografica/immagine condivisibile, specifica il layout documento A4 verticale (l'unico che garantisce visualizzazione completa in anteprima chat WhatsApp senza cropping) con elenco dei badge in evidenza.

* **INSTAGRAM & TIKTOK (Social Ads):**
  * *Tono:* Dinamico, visivo, con hook immediato a prova di scroll per catturare tecnici specializzati nel feed.
  * *Headline:* Hook accattivante a caratteri cubitali (es. *"Tecnico Fotovoltaico: ENTRA IN UNA MULTINAZIONALE"*).
  * *BodyText:* Copy breve, bullet point con i perk tecnici (grandi impianti >100 kW, stabilità, retribuzione) e massima facilità di candidatura.
  * *CallToAction:* Invito immediato al click (es. *"Scopri l'offerta / Link in Bio"* o *"Invia candidatura"*).
  * *CreativeNotes:* Descrivi le specifiche per la creative visual (formato quadrato 1080x1080 per Feed o 9:16 per Stories/TikTok, soggetto con tecnico in DPI/elmetto, grafica a contrasto con badge Gyver x Azienda e pill testuali).

---

## 2. Cosa non funzionava nelle versioni precedenti e cosa è cambiato

| Problema Riscontrato | Causa | Soluzione Implementata |
| :--- | :--- | :--- |
| **Allucinazioni sui benefit** | Il modello aggiungeva benefit generici ("smart working", "corsi di inglese") non pertinenti a tecnici di cantiere. | Introdotto il vincolo esplicito: *"DIVIETO ASSOLUTO DI ALLUCINAZIONE"*. Se un dato non è nella Job Offer, non viene inserito. |
| **Tono da tech/SaaS** | I prompt iniziali usavano termini generici per ruoli software (es. "tecnologie citate", hashtag da developer). | Ricalibrato il system prompt su **tecnici specializzati, elettrotecnica e cantieri**, con enfasi su elementi concreti (kW impianti, cabine MT/BT, trasferte retribuite, CCNL). |
| **Mancanza di indicazioni visive** | Le note creative erano vuote o generiche ("nessuna immagine"). | Allineamento agli esempi della traccia: istruzione all'LLM di descrivere il **layout A4 verticale** per anteprime WhatsApp e il formato **1080x1080 quadrato** per social ads. |
| **Formato output imprevedibile** | Usando prompt con istruzioni JSON nel solo testo, a volte il modello restituiva blocchi markdown ` ```json ` con commenti o campi mancanti. | Passaggio obbligato a **OpenAI Structured Outputs** con `response_format: { type: 'json_schema', json_schema: { strict: true } }`. |

---

## 3. Come vincoliamo il modello a rispettare l'output previsto

Utilizziamo la funzionalità nativa di **Strict JSON Schema** di OpenAI API:

```json
{
  "name": "advertisement_generation",
  "strict": true,
  "schema": {
    "type": "object",
    "properties": {
      "variants": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "headline": { "type": "string" },
            "bodyText": { "type": "string" },
            "callToAction": { "type": "string" },
            "creativeNotes": { "type": "string" }
          },
          "required": ["headline", "bodyText", "callToAction", "creativeNotes"],
          "additionalProperties": false
        }
      }
    },
    "required": ["variants"],
    "additionalProperties": false
  }
}
```

Grazie a `strict: true`, il provider garantisce a livello di decoding constrained che ogni token generato rispetti grammaticalmente la struttura specificata.

---

## 4. Cosa succede quando la risposta non è conforme o l'API fallisce

La pipeline in [`LlmService.generateAdvertisement`](file:///Users/mattiapiazzolla/Desktop/gyver/apps/api/src/llm/llm.service.ts#L159) implementa una strategia di difesa a più livelli:

1. **Doppia Validazione Applicativa:**
   * Una volta parsato il JSON, il payload viene passato a `plainToInstance` e convalidato tramite `class-validator` con [`GeneratedAdvertisementOutputDto`](file:///Users/mattiapiazzolla/Desktop/gyver/apps/api/src/llm/dto/generated-advertisement-output.dto.ts).
   * Se i campi non soddisfano i vincoli di tipo o lunghezza, viene sollevata una `UnprocessableEntityException`.

2. **Retry Automatico con Backoff Lineare/Esponenziale:**
   * La chiamata LLM gestisce fino a **2 tentativi di retry** per errori transitori:
     * Rate Limit (`429`)
     * Errori temporanei del provider (`5xx`)
     * Timeout di connessione (configurato a 15.000 ms)
     * Fallimento della validazione di schema applicativa
   * Tra un tentativo e l'altro viene applicato un delay incrementale (`attempt * 1000 ms`).

3. **Mappatura Eccezioni HTTP:**
   * Errori di autenticazione (`401`, `403` da OpenAI) -> `InternalServerErrorException` protetta (non espone dettagli critici all'esterno).
   * Errori non recuperabili di generazione -> `BadGatewayException` con messaggio comprensibile rivolto all'operatore: *"Impossibile generare il contenuto pubblicitario tramite il provider AI. Riprova più tardi."*
   * Nel frontend, la UI intercetta lo status `502` mostrando un banner di alert dedicato con pulsante "Riprova".
