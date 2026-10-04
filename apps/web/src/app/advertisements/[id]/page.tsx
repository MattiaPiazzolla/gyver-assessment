'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { AdvertisementDetail } from '@/types/api';
import { VariantList } from '@/components/advertisements/variant-list';
import { VariantCreateForm } from '@/components/advertisements/variant-create-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdvertisementDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const advertisementId = resolvedParams.id;

  const [advertisement, setAdvertisement] = useState<AdvertisementDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
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
    void fetchDetail();
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
              onClick={fetchDetail}
              className="px-4 py-2 bg-[#FF4B1F] hover:bg-[#FF5525] text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Riprova
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-[#181818] text-[#F5F5F5] border border-[#292929] hover:bg-[#222222] text-xs font-semibold rounded-lg transition-colors"
            >
              &larr; Torna alla lista
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const variantsList = advertisement.variants ?? [];

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      {/* Header navigazione */}
      <div>
        <Link
          href="/"
          className="text-xs font-mono text-[#A6A6A6] hover:text-[#FF4B1F] inline-flex items-center gap-1.5 mb-4 transition-colors"
        >
          <span>&larr;</span>
          <span>Torna a tutti gli annunci</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#292929] pb-6">
          <div>
            <div className="text-xs font-mono text-[#FF4B1F] uppercase tracking-wider">
              {"// Scheda Annuncio"}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#F5F5F5] mt-1">
              Dettaglio Annuncio
            </h1>
            <p className="text-xs font-mono text-[#737373] mt-1">ID: {advertisement.id}</p>
          </div>
          <span
            className={`px-3 py-1 text-xs font-mono font-semibold rounded-full border self-start sm:self-auto ${
              advertisement.status === 'PUBLISHED'
                ? 'bg-emerald-950/50 text-emerald-400 border-emerald-900/60'
                : advertisement.status === 'ARCHIVED'
                ? 'bg-[#181818] text-[#737373] border-[#292929]'
                : 'bg-amber-950/50 text-amber-400 border-amber-900/60'
            }`}
          >
            {advertisement.status}
          </span>
        </div>
      </div>

      {/* Scheda Riepilogo Parametri Annuncio & Job Offer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Metadati Annuncio */}
        <div className="border border-[#292929] rounded-xl p-6 bg-[#111111] space-y-4">
          <h2 className="text-xs font-mono font-semibold text-[#A6A6A6] uppercase tracking-wider">
            {"// Configurazione Canale & Formato"}
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm pt-1">
            <div>
              <span className="text-xs text-[#737373] font-mono block">Canale:</span>
              <span className="font-semibold text-[#F5F5F5] font-mono">{advertisement.channel}</span>
            </div>
            <div>
              <span className="text-xs text-[#737373] font-mono block">Formato:</span>
              <span className="font-semibold text-[#F5F5F5] font-mono">{advertisement.format}</span>
            </div>
            <div>
              <span className="text-xs text-[#737373] font-mono block">Target Location:</span>
              <span className="font-medium text-[#F5F5F5]">
                {advertisement.targetLocation || 'Globale (Tutte le sedi)'}
              </span>
            </div>
            <div>
              <span className="text-xs text-[#737373] font-mono block">Varianti generate:</span>
              <span className="font-mono text-[#FF4B1F] font-bold">{variantsList.length}</span>
            </div>
          </div>
        </div>

        {/* Job Offer di riferimento */}
        <div className="border border-[#292929] rounded-xl p-6 bg-[#111111] space-y-4">
          <h2 className="text-xs font-mono font-semibold text-[#A6A6A6] uppercase tracking-wider">
            {"// Job Offer di Origine"}
          </h2>
          <div className="text-sm pt-1 space-y-2">
            <p className="font-bold text-[#F5F5F5] text-base leading-snug">
              {advertisement.jobOffer?.title ?? 'Job Offer non specificata'}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#A6A6A6]">
              <span className="text-[#555555]">Sede:</span>
              <span>
                {advertisement.jobOffer?.defaultLocation ||
                  advertisement.jobOffer?.location ||
                  'Sede aziendale'}
              </span>
            </div>
            <p className="text-xs text-[#737373] font-mono pt-1">
              ID: {advertisement.jobOffer?.id}
            </p>
          </div>
        </div>
      </div>

      {/* Sezione Varianti */}
      <div className="space-y-6 pt-6 border-t border-[#292929]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight text-[#F5F5F5]">
                Varianti Generate
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-mono rounded-full border border-[#292929] bg-[#181818] text-[#A6A6A6]">
                {variantsList.length}{' '}
                {variantsList.length === 1 ? 'variante' : 'varianti'}
              </span>
            </div>
            <p className="text-xs text-[#737373] mt-1">
              Testi ottimizzati per il canale selezionato. Puoi modificare qualsiasi variante o generarne di nuove con AI.
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
          onRefresh={fetchDetail}
        />
      </div>
    </main>
  );
}