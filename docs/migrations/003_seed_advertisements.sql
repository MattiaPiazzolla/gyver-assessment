-- docs/migrations/003_seed_advertisements.sql

-- 1. Annuncio per JOB_BOARD (Formato JOB_POSTING, Location: Milano)
INSERT INTO advertisements (id, job_offer_id, channel, format, target_location, status)
VALUES (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'JOB_BOARD',
    'JOB_POSTING',
    'Milano (Ibrido)',
    'PUBLISHED'
) ON CONFLICT (id) DO NOTHING;

-- Variante 1 per Annuncio 1 (Standard)
INSERT INTO advertisement_variants (
    id, advertisement_id, variant_name, headline, body_text, call_to_action,
    creative_notes, generated_headline, generated_body, generated_cta, is_edited, is_selected
) VALUES (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Standard Professionale',
    'Senior Frontend Engineer (React/TypeScript) — Milano',
    'Unisciti al nostro team per scalare una piattaforma SaaS innovativa. Cerchiamo 4+ anni di esperienza con React, TypeScript e Next.js.',
    'Candidati Ora',
    'Banner corporate con logo e stack tecnologico',
    'Senior Frontend Engineer (React/TypeScript) — Milano',
    'Unisciti al nostro team per scalare una piattaforma SaaS innovativa. Cerchiamo 4+ anni di esperienza con React, TypeScript e Next.js.',
    'Candidati Ora',
    false,
    true
) ON CONFLICT (id) DO NOTHING;


-- 2. Annuncio per INSTAGRAM (Formato STORY, Location specifica: Remoto (Italia))
INSERT INTO advertisements (id, job_offer_id, channel, format, target_location, status)
VALUES (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'INSTAGRAM',
    'STORY',
    'Remoto (Italia)',
    'DRAFT'
) ON CONFLICT (id) DO NOTHING;

-- Variante 1 per Annuncio 2 (Focus Sfida Tecnica)
INSERT INTO advertisement_variants (
    id, advertisement_id, variant_name, headline, body_text, call_to_action,
    creative_notes, generated_headline, generated_body, generated_cta, is_edited, is_selected
) VALUES (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    'Focus Sfida Tecnica',
    'Ami React e le performance estreme?',
    'Stiamo cercando un Senior Frontend Dev per rivoluzionare la nostra UI SaaS in Next.js e Tailwind. Lavora da dove vuoi in Italia!',
    'Swipe Up per candidarti',
    'Video breve con snippet di codice animato e stickers UI',
    'Ami React e le performance estreme?',
    'Stiamo cercando un Senior Frontend Dev per rivoluzionare la nostra UI SaaS in Next.js e Tailwind. Lavora da dove vuoi in Italia!',
    'Swipe Up per candidarti',
    false,
    true
) ON CONFLICT (id) DO NOTHING;

-- Variante 2 per Annuncio 2 (Focus Crescita & Team)
INSERT INTO advertisement_variants (
    id, advertisement_id, variant_name, headline, body_text, call_to_action,
    creative_notes, generated_headline, generated_body, generated_cta, is_edited, is_selected
) VALUES (
    '20000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000002',
    'Focus Team & Impatto',
    'Costruisci il frontend del futuro insieme a noi',
    'Collabora con designer e ingegneri di talento su architetture moderne. Cerchiamo esperienza solida in TypeScript.',
    'Scopri la posizione',
    'Foto del team durante un hackathon con quote testuale in sovrimpressione',
    'Costruisci il frontend del futuro insieme a noi',
    'Collabora con designer e ingegneri di talento su architetture moderne. Cerchiamo esperienza solida in TypeScript.',
    'Scopri la posizione',
    false,
    false
) ON CONFLICT (id) DO NOTHING;


-- 3. Annuncio per WHATSAPP (Formato MESSAGE, Location: Milano)
INSERT INTO advertisements (id, job_offer_id, channel, format, target_location, status)
VALUES (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'WHATSAPP',
    'MESSAGE',
    'Milano (Ibrido)',
    'DRAFT'
) ON CONFLICT (id) DO NOTHING;

-- Variante 1 per Annuncio 3 (Messaggio Diretto)
INSERT INTO advertisement_variants (
    id, advertisement_id, variant_name, headline, body_text, call_to_action,
    creative_notes, generated_headline, generated_body, generated_cta, is_edited, is_selected
) VALUES (
    '20000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000003',
    'Messaggio Diretto e Informale',
    'Opportunità Senior Frontend Engineer a Milano',
    'Ciao! Abbiamo aperto una posizione Senior Frontend Engineer (React/TypeScript/Next.js) nel nostro team a Milano con formula ibrida. Se ti interessa dare un’occhiata ai dettagli completi, fammi sapere!',
    'Rispondi a questo messaggio',
    NULL,
    'Opportunità Senior Frontend Engineer a Milano',
    'Ciao! Abbiamo aperto una posizione Senior Frontend Engineer (React/TypeScript/Next.js) nel nostro team a Milano con formula ibrida. Se ti interessa dare un’occhiata ai dettagli completi, fammi sapere!',
    'Rispondi a questo messaggio',
    false,
    true
) ON CONFLICT (id) DO NOTHING;
