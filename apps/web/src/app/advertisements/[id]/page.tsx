'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { AdvertisementDetail } from '@/types/api';
import { VariantList } from '@/components/advertisements/variant-list';
import { VariantCreateForm } from '@/components/advertisements/variant-create-form';
import { ChannelBadge, formatLabels, StatusBadge } from '@/components/advertisements/advertisement-display';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdvertisementDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const advertisementId = resolvedParams.id;

  const [advertisement, setAdvertisement] = useState<AdvertisementDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const data = await api.getAdvertisementById(advertisementId);
      setAdvertisement(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Impossibile caricare il dettaglio annuncio.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [advertisementId]);

  useEffect(() => {
    void fetchDetail(true);
  }, [fetchDetail]);

  const handleVariantCreated = async () => {
    await fetchDetail();
  };

  if (isLoading) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center p-16 border border-[#292929] rounded-2xl bg-[#111111] text-[#A6A6A6]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#292929] border-t-[#FF4B1F] mb-4" />
          <p className="text-sm font-mono">Caricamento dettagli annuncio...</p>
        </div>
      </main>
    );
  }

  if (error || !advertisement) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-8 border border-red-900/60 rounded-2xl bg-red-950/30 text-red-300">
          <p className="font-semibold text-base">Errore nel caricamento:</p>
          <p className="text-sm text-red-400 mt-1">{error || 'Annuncio non trovato.'}</p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => void fetchDetail(true)}
              className="btn-accent px-4 py-2 text-xs font-semibold cursor-pointer"
            >
              Riprova
            </button>
            <Link
              href="/"
              className="btn-secondary px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              &larr; Torna alla lista
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const variantsList = advertisement.variants ?? [];
  const jobLocation = advertisement.jobOffer?.defaultLocation || advertisement.jobOffer?.location;
  const distributionLocation = advertisement.targetLocation || jobLocation || 'Area non specificata';

  return (
    <main className="mx-auto max-w-4xl space-y-7 px-4 py-7 sm:space-y-8 sm:px-6 sm:py-9 lg:px-8">
      <header>
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#A6A6A6] transition-colors hover:text-white"
        >
          <span>&larr;</span>
          <span>Tutti gli annunci</span>
        </Link>
        <div className="flex flex-col gap-3 border-b border-[#292929]/80 pb-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#EF3C00]">Annuncio</p>
            <h1 className="mt-2 max-w-4xl text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
              {advertisement.jobOffer?.title ?? 'Dettaglio Annuncio'}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <ChannelBadge channel={advertisement.channel} />
              <span className="text-sm text-[#A6A6A6]">{formatLabels[advertisement.format]}</span>
            </div>
          </div>
          <div className="shrink-0 sm:pt-1"><StatusBadge status={advertisement.status} /></div>
        </div>
      </header>

      <section aria-labelledby="distribution-heading" className="max-w-3xl border-l-2 border-[#EF3C00] py-1 pl-5 sm:pl-7">
        <h2 id="distribution-heading" className="text-sm font-medium text-[#A6A6A6]">Area di diffusione</h2>
        <p className="mt-1 text-2xl font-semibold leading-snug tracking-tight text-white sm:text-3xl">
          {distributionLocation}
        </p>
        {jobLocation && jobLocation !== distributionLocation && (
          <p className="mt-2 text-sm leading-relaxed text-[#A6A6A6]">
            Sede della posizione <span className="ml-1 font-medium text-[#E1E1E6]">{jobLocation}</span>
          </p>
        )}
      </section>

      {/* Sezione Varianti */}
      <div className="max-w-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Varianti Generate
              </h2>
              <span className="px-3 py-1 text-xs font-medium rounded-full border border-[#383842] bg-[#242528] text-white">
                {variantsList.length}{' '}
                {variantsList.length === 1 ? 'variante' : 'varianti'}
              </span>
            </div>
            <p className="text-sm text-[#8E8E93] mt-1">
              Modifica le varianti o creane altre con l’AI.
            </p>
          </div>

          <VariantCreateForm
            advertisementId={advertisement.id}
            onSuccess={handleVariantCreated}
          />
        </div>

        <VariantList
          advertisementId={advertisement.id}
          variants={variantsList}
          channel={advertisement.channel}
          format={advertisement.format}
          jobOfferTitle={advertisement.jobOffer?.title}
          onRefresh={() => fetchDetail()}
        />
      </div>

      <details className="group border-t border-[#292929]/80 pt-5 text-sm">
        <summary className="inline-flex cursor-pointer list-none items-center gap-2 text-[#8E8E93] transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
          Dettagli tecnici
          <span aria-hidden="true" className="text-base leading-none transition-transform group-open:rotate-45">+</span>
        </summary>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="min-w-0">
            <dt className="text-xs text-[#8E8E93]">ID annuncio</dt>
            <dd className="mt-1 break-all font-mono text-xs text-[#C8C8CC]">{advertisement.id}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-[#8E8E93]">ID posizione</dt>
            <dd className="mt-1 break-all font-mono text-xs text-[#C8C8CC]">{advertisement.jobOffer?.id ?? advertisement.jobOfferId}</dd>
          </div>
        </dl>
      </details>
    </main>
  );
}
