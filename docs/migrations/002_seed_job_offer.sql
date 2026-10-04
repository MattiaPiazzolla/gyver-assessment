-- docs/migrations/002_seed_job_offer.sql

INSERT INTO job_offers (id, title, description, requirements, default_location)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Tecnico elettricista fotovoltaico - AB Group SpA',
    'AB Group — multinazionale della cogenerazione, biogas e rinnovabili con oltre 1.700 dipendenti presente in 20 Paesi.

Carriera da Tecnico Fotovoltaico MT/BT — Costruisci una carriera nella costruzione e avviamento di grandi impianti (>100 kW).

Responsabilità principali:
- Effettuare sopralluoghi tecnici in cantiere, definire lo stato di fatto e redigere report tecnici da condividere con PM ed Engineering.
- Coordinare le attività di montaggio strutture, moduli FV, cablaggi DC/AC e quadri elettrici realizzati da terze parti.
- Verificare la corretta esecuzione secondo disegni tecnici e programma lavori.
- Eseguire collaudi, verifiche preliminari, test funzionali e avviamento impianto.
- Verificare il rispetto delle normative HSE e supportare il controllo qualità.
- Eseguire interventi di manutenzione straordinaria e riparazione guasti sul campo.

Pacchetto retributivo e benefit:
- Contratto a tempo indeterminato
- RAL da 32.000 € a 38.000 € in base all''esperienza maturata
- Indennità di 60 € lordi a notte per trasferte multi-giorno
- Buoni pasto / Ticket da 13 € per ogni giorno lavorato
- Ore di viaggio oltre le 8 ore giornaliere pagate all''85% come da CCNL
- Opportunità di crescita a Ruoli Gestionali (Capo Cantiere / Site Manager) e mobilità interna',
    '- Diploma tecnico in elettrotecnica o titolo equivalente
- 3-5 anni di esperienza nell''installazione e avviamento di impianti fotovoltaici industriali (>100 kW)
- Capacità di lettura di schemi elettrici unifilari e layout FV
- Conoscenza approfondita di inverter, sistemi BESS e strumentazione di collaudo/verifica
- Esperienza comprovata su cabine secondarie e impianti di media tensione (MT/BT)
- Disponibilità a trasferte giornaliere frequenti e sporadiche trasferte multi-giorno (2-3 giorni)',
    'Via Artigianato, 27, 25034 Orzinuovi BS'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    requirements = EXCLUDED.requirements,
    default_location = EXCLUDED.default_location;
