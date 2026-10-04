-- 1. Aggiunge company_id a job_offers con default su Tenant A per i record esistenti
ALTER TABLE job_offers 
ADD COLUMN IF NOT EXISTS company_id UUID NOT NULL DEFAULT 'a0000000-0000-0000-0000-000000000001';

-- 2. Indice per velocizzare le query filtrate su ownership
CREATE INDEX IF NOT EXISTS idx_job_offers_company_id ON job_offers(company_id);

-- 3. Record di test per Tenant B per verificare l'isolamento degli annunci
INSERT INTO job_offers (id, company_id, title, description, requirements, default_location)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000002',
  'Manutentore Elettromeccanico Industriale (PLC)',
  'Azienda metalmeccanica specializzata in automazione industriale. Ricerca manutentore per diagnostica guasti su quadri elettrici, azionamenti inverter e bordo macchina su linee automatizzate. Contratto a tempo indeterminato, RAL 34.000 - 40.000 €.',
  '- Esperienza 3+ anni in manutenzione elettromeccanica industriale\n- Lettura schemi elettrici e diagnostica base PLC (Siemens S7/TIA Portal)\n- Diploma perito elettrotecnico o meccatronico',
  'Bergamo (BG)'
)
ON CONFLICT (id) DO UPDATE SET
  company_id = EXCLUDED.company_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  default_location = EXCLUDED.default_location;

INSERT INTO advertisements (id, job_offer_id, channel, format, target_location, status)
VALUES (
  '10000000-0000-0000-0000-000000000099',
  '00000000-0000-0000-0000-000000000002',
  'JOB_BOARD',
  'JOB_POSTING',
  'Bergamo (BG)',
  'PUBLISHED'
)
ON CONFLICT (id) DO UPDATE SET
  target_location = EXCLUDED.target_location,
  status = EXCLUDED.status;

INSERT INTO advertisement_variants (
  id,
  advertisement_id,
  variant_name,
  headline,
  body_text,
  call_to_action,
  generated_headline,
  generated_body,
  generated_cta
) VALUES (
  '20000000-0000-0000-0000-000000000099',
  '10000000-0000-0000-0000-000000000099',
  'Standard Professionale',
  'Manutentore Elettromeccanico PLC — Bergamo',
  'Cerchiamo tecnico con esperienza su linee automatizzate, inverter e PLC per assunzione a tempo indeterminato.',
  'Candidati ora',
  'Manutentore Elettromeccanico PLC — Bergamo',
  'Cerchiamo tecnico con esperienza su linee automatizzate, inverter e PLC per assunzione a tempo indeterminato.',
  'Candidati ora'
)
ON CONFLICT (id) DO UPDATE SET
  headline = EXCLUDED.headline,
  body_text = EXCLUDED.body_text,
  call_to_action = EXCLUDED.call_to_action;
