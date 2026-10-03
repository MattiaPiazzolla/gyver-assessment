-- docs/migrations/004_verify_queries.sql

-- 1. Verifica conteggi base
SELECT 
    (SELECT COUNT(*) FROM job_offers) AS total_job_offers,
    (SELECT COUNT(*) FROM advertisements) AS total_ads,
    (SELECT COUNT(*) FROM advertisement_variants) AS total_variants;

-- 2. Recupero annunci per specifica Job Offer con conteggio varianti collegate
SELECT 
    a.id AS ad_id,
    a.channel,
    a.format,
    a.target_location,
    a.status,
    COUNT(v.id) AS variants_count
FROM advertisements a
LEFT JOIN advertisement_variants v ON v.advertisement_id = a.id
WHERE a.job_offer_id = '00000000-0000-0000-0000-000000000001'
GROUP BY a.id, a.channel, a.format, a.target_location, a.status;

-- 3. Filtro per Canale (INSTAGRAM) con dettaglio varianti (titolo, copy e flag is_edited)
SELECT 
    a.id AS ad_id,
    a.channel,
    a.format,
    a.target_location,
    v.id AS variant_id,
    v.variant_name,
    v.headline,
    v.is_edited,
    v.is_selected
FROM advertisements a
JOIN advertisement_variants v ON v.advertisement_id = a.id
WHERE a.channel = 'INSTAGRAM';
