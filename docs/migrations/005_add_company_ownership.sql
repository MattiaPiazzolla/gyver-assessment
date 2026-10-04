-- 1. Aggiunge company_id a job_offers con default su Tenant A per i record esistenti
ALTER TABLE job_offers 
ADD COLUMN company_id UUID NOT NULL DEFAULT 'a0000000-0000-0000-0000-000000000001';

-- 2. Indice per velocizzare le query filtrate su ownership
CREATE INDEX idx_job_offers_company_id ON job_offers(company_id);

-- 3. Record di test per Tenant B per verificare l'isolamento degli annunci
INSERT INTO job_offers (id, company_id, title, description, requirements, default_location)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000002',
  'Backend Engineer (Tenant B)',
  'Ruolo riservato ad azienda B.',
  'Competenze Go e Kubernetes.',
  'Roma'
);

INSERT INTO advertisements (id, job_offer_id, channel, format, target_location, status)
VALUES (
  '10000000-0000-0000-0000-000000000099',
  '00000000-0000-0000-0000-000000000002',
  'JOB_BOARD',
  'JOB_POSTING',
  'Roma',
  'PUBLISHED'
);

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
  'Variante Privata Tenant B',
  'Annuncio Riservato B',
  'Testo riservato ad azienda B.',
  'Candidati qui',
  'Annuncio Riservato B',
  'Testo riservato ad azienda B.',
  'Candidati qui'
);
