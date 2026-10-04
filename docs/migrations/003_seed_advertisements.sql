-- docs/migrations/003_seed_advertisements.sql

-- Pulizia annunci precedenti per la job offer di test per garantire consistenza assoluta
DELETE FROM advertisements WHERE job_offer_id = '00000000-0000-0000-0000-000000000001';

-- 1. Annuncio per JOB_BOARD (Indeed - Solo Testo Strutturato, Location: Orzinuovi BS)
INSERT INTO advertisements (id, job_offer_id, channel, format, target_location, status)
VALUES (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'JOB_BOARD',
    'JOB_POSTING',
    'Via Artigianato, 27, 25034 Orzinuovi BS',
    'PUBLISHED'
);

-- Variante 1 per Annuncio 1 (Indeed - Job Description ad hoc)
INSERT INTO advertisement_variants (
    id, advertisement_id, variant_name, headline, body_text, call_to_action,
    creative_notes, generated_headline, generated_body, generated_cta, is_edited, is_selected
) VALUES (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Indeed Formattato Standard',
    'Tecnico Fotovoltaico MT/BT — AB Group SpA (Orzinuovi)',
    'Assunzione diretta a tempo indeterminato in AB Group SpA.
AB Group è una multinazionale con 1700 dipendenti e più di 40 anni di storia in impianti industriali, cogenerazione e fotovoltaico.
L’opportunità di carriera rientra nel team di commissioning e manutenzione di impianti fotovoltaici presso i clienti di AB Group.
Sede centrale a Orzinuovi (Brescia) con trasferte giornaliere e sporadicamente di 2/3 giorni.

Carriera da capo cantiere fotovoltaico:
- Coordina l''installazione elettrica fotovoltaica e assicurati dell''avanzamento lavori insieme al PM
- Esegui collaudi e test funzionali su impianti di grandi dimensioni (>100 kW)
- Esegui manutenzioni sul campo in caso di guasti

Quello che ti offrirà l’azienda:
- Contratto a tempo indeterminato
- RAL iniziale da €38.000 + indennità trasferta notturna (60 €/notte)
- Ticket da 13 € per ogni giorno lavorato
- Crescita a ruoli gestionali (Site Manager) e possibile mobilità interna

Il tuo profilo:
- 3-5 anni di esperienza su installazione e avviamento fotovoltaico industriale (> 100 kW)
- Esperienza in cabine MT/BT
- Disponibilità a trasferte sul territorio',
    'Candidati su Indeed',
    'Solo testo formattato a sezioni ed elenchi puntati. Include metadati per la job board: Competenze (Fotovoltaico industriale, Cabine secondarie - MT/BT), Esperienza (3-5 anni).',
    'Tecnico Fotovoltaico MT/BT — AB Group SpA (Orzinuovi)',
    'Assunzione diretta a tempo indeterminato in AB Group SpA.
AB Group è una multinazionale con 1700 dipendenti e più di 40 anni di storia in impianti industriali, cogenerazione e fotovoltaico.
L’opportunità di carriera rientra nel team di commissioning e manutenzione di impianti fotovoltaici presso i clienti di AB Group.
Sede centrale a Orzinuovi (Brescia) con trasferte giornaliere e sporadicamente di 2/3 giorni.

Carriera da capo cantiere fotovoltaico:
- Coordina l''installazione elettrica fotovoltaica e assicurati dell''avanzamento lavori insieme al PM
- Esegui collaudi e test funzionali su impianti di grandi dimensioni (>100 kW)
- Esegui manutenzioni sul campo in caso di guasti

Quello che ti offrirà l’azienda:
- Contratto a tempo indeterminato
- RAL iniziale da €38.000 + indennità trasferta notturna (60 €/notte)
- Ticket da 13 € per ogni giorno lavorato
- Crescita a ruoli gestionali (Site Manager) e possibile mobilità interna

Il tuo profilo:
- 3-5 anni di esperienza su installazione e avviamento fotovoltaico industriale (> 100 kW)
- Esperienza in cabine MT/BT
- Disponibilità a trasferte sul territorio',
    'Candidati su Indeed',
    false,
    true
);


-- 2. Annuncio per WHATSAPP (Immagine foglio A4 + Messaggio chat, Location: Orzinuovi BS + trasferte)
INSERT INTO advertisements (id, job_offer_id, channel, format, target_location, status)
VALUES (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'WHATSAPP',
    'MESSAGE',
    'Orzinuovi (BS) + trasferte',
    'PUBLISHED'
);

-- Variante 1 per Annuncio 2 (Layout A4 con Badge Retributivi)
INSERT INTO advertisement_variants (
    id, advertisement_id, variant_name, headline, body_text, call_to_action,
    creative_notes, generated_headline, generated_body, generated_cta, is_edited, is_selected
) VALUES (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    'Layout A4 per Anteprima Chat',
    'Tecnico Fotovoltaico: coordinamento cantieri e manutenzione',
    'AB Group SpA cerca Tecnico Fotovoltaico per grandi impianti industriali.
💰 RAL iniziale da €38.000 + indennità
📄 Tempo Indeterminato
📈 Crescita a site manager o mobilità interna
📍 Orzinuovi (BS) + trasferte
⚡ Impianti fotovoltaici industriali (>100 kW) e cabine MT/BT

Ti interessa approfondire la posizione o ricevere maggiori dettagli?',
    'Rispondi su WhatsApp per candidarti in 30 secondi',
    'Formato A4 verticale con intestazione logo AB Group. Include 5 badge in evidenza (RAL, Tempo Indeterminato, Crescita, Sede, Impianti FV) ottimizzati per visualizzazione intera in anteprima chat WhatsApp.',
    'Tecnico Fotovoltaico: coordinamento cantieri e manutenzione',
    'AB Group SpA cerca Tecnico Fotovoltaico per grandi impianti industriali.
💰 RAL iniziale da €38.000 + indennità
📄 Tempo Indeterminato
📈 Crescita a site manager o mobilità interna
📍 Orzinuovi (BS) + trasferte
⚡ Impianti fotovoltaici industriali (>100 kW) e cabine MT/BT

Ti interessa approfondire la posizione o ricevere maggiori dettagli?',
    'Rispondi su WhatsApp per candidarti in 30 secondi',
    false,
    true
);


-- 3. Annuncio per INSTAGRAM / TIKTOK (Creative 1080x1080 Ads Social)
INSERT INTO advertisements (id, job_offer_id, channel, format, target_location, status)
VALUES (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'INSTAGRAM',
    'FEED_POST',
    'Brescia e province limitrofe',
    'PUBLISHED'
);

-- Variante 1 per Annuncio 3 (Creative 1080x1080 con Hook Multinazionale)
INSERT INTO advertisement_variants (
    id, advertisement_id, variant_name, headline, body_text, call_to_action,
    creative_notes, generated_headline, generated_body, generated_cta, is_edited, is_selected
) VALUES (
    '20000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000003',
    'Creative 1080x1080 — Hook Multinazionale',
    'Tecnico Fotovoltaico: ENTRA IN UNA MULTINAZIONALE',
    'Sei un elettricista o tecnico con esperienza su grandi impianti?
Unisciti ad AB Group SpA: leader internazionale nelle energie rinnovabili!
Lavora su impianti fotovoltaici industriali (>100 kW) con assunzione a tempo indeterminato e RAL iniziale fino a €38.000 + indennità.

Fai il salto di qualità nella tua carriera tecnica ⚡',
    'Scopri di più / Candidati ora',
    'Creative quadrata 1080x1080: foto di tecnico con elmetto bianco e DPI gialli su sfondo pannelli fotovoltaici e cielo azzurro. Testo overlay ad alto contrasto: "Tecnico Fotovoltaico" con pill arancione, riquadro "ENTRA IN UNA MULTINAZIONALE" e sottotitolo "Impianti FV >100 kW". Co-branding Gyver x AB Group in alto.',
    'Tecnico Fotovoltaico: ENTRA IN UNA MULTINAZIONALE',
    'Sei un elettricista o tecnico con esperienza su grandi impianti?
Unisciti ad AB Group SpA: leader internazionale nelle energie rinnovabili!
Lavora su impianti fotovoltaici industriali (>100 kW) con assunzione a tempo indeterminato e RAL iniziale fino a €38.000 + indennità.

Fai il salto di qualità nella tua carriera tecnica ⚡',
    'Scopri di più / Candidati ora',
    false,
    true
);

-- Variante 2 per Annuncio 3 (Focus Crescita & Cantiere)
INSERT INTO advertisement_variants (
    id, advertisement_id, variant_name, headline, body_text, call_to_action,
    creative_notes, generated_headline, generated_body, generated_cta, is_edited, is_selected
) VALUES (
    '20000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000003',
    'Focus Avanzamento & Cantiere MT/BT',
    'Diventa Capo Cantiere Fotovoltaico in AB Group',
    'Hai esperienza su cabine secondarie MT/BT e impianti fotovoltaici?
Cerchiamo professionisti capaci di coordinare le squadre in cantiere, eseguire test prestazionali e gestire collaudi complessi.
Assunzione diretta, benefit e piano di crescita a site manager.',
    'Invia candidatura',
    'Visual 1080x1080: focus sul cantiere tecnologico e cabina MT/BT, badge centrale con retribuzione e contratto a tempo indeterminato.',
    'Diventa Capo Cantiere Fotovoltaico in AB Group',
    'Hai esperienza su cabine secondarie MT/BT e impianti fotovoltaici?
Cerchiamo professionisti capaci di coordinare le squadre in cantiere, eseguire test prestazionali e gestire collaudi complessi.
Assunzione diretta, benefit e piano di crescita a site manager.',
    'Invia candidatura',
    false,
    false
);


