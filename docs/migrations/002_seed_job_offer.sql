-- docs/migrations/002_seed_job_offer.sql

INSERT INTO job_offers (id, title, description, requirements, default_location)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Senior Frontend Engineer',
    'Cerchiamo un Senior Frontend Engineer con solida esperienza in React e TypeScript per guidare lo sviluppo delle interfacce utente della nostra piattaforma SaaS. La persona collaborerà a stretto contatto con product designer e backend engineer per rilasciare feature performanti e scalabili.',
    '- 4+ anni di esperienza con React e modern JavaScript/TypeScript
- Ottima padronanza di Next.js, state management e Tailwind CSS
- Esperienza con architetture modulari e ottimizzazione delle performance web
- Approccio orientato alla qualità del codice, test automatizzati e buone pratiche di UI/UX',
    'Milano (Ibrido)'
)
ON CONFLICT (id) DO NOTHING;
