'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { AdvertisementChannel, AdvertisementListItem, JobOfferSummary } from '@/types/api';
import { AdvertisementList } from '@/components/advertisements/advertisement-list';
import { AdvertisementFilters } from '@/components/advertisements/advertisement-filters';
import { AdvertisementForm } from '@/components/advertisements/advertisement-form';

export default function HomePage() {
  const [advertisements, setAdvertisements] = useState<AdvertisementListItem[]>([]);
  const [jobOffers, setJobOffers] = useState<JobOfferSummary[]>([]);
  const [selectedJobOfferId, setSelectedJobOfferId] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<AdvertisementChannel | ''>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  const fetchJobOffers = useCallback(async () => {
    try {
      const data = await api.getJobOffers();
      setJobOffers(data);
    } catch {
      // Ignora errore non bloccante
    }
  }, []);

  const fetchAdvertisements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters = {
        ...(selectedJobOfferId ? { jobOfferId: selectedJobOfferId } : {}),
        ...(selectedChannel ? { channel: selectedChannel } : {}),
      };
      const data = await api.getAdvertisements(filters);
      setAdvertisements(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Impossibile caricare gli annunci.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedJobOfferId, selectedChannel]);

  useEffect(() => {
    fetchJobOffers();
  }, [fetchJobOffers]);

  useEffect(() => {
    fetchAdvertisements();
  }, [fetchAdvertisements]);

  const handleResetFilters = () => {
    setSelectedJobOfferId('');
    setSelectedChannel('');
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Brand Hero Section */}
      <section className="relative rounded-2xl border border-[#292929] bg-[#111111]/80 backdrop-blur-sm p-8 sm:p-12 lg:p-16 overflow-hidden">
        {/* Subtle decorative technical grid accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[#FF4B1F]/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-3xl space-y-6 relative z-10">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#292929] bg-[#181818] text-xs font-mono tracking-wider text-[#A6A6A6]">
            <span className="text-[#FF4B1F]">⚡</span>
            <span>GYVER DELIVERY // SEZIONE ANNUNCI</span>
          </div>

          {/* Large Headline with Orange Highlight */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.035em] leading-[0.98] text-[#F5F5F5]">
            LA TUA PROSSIMA<br />
            OPPORTUNITÀ DI<br />
            <span className="text-[#FF4B1F]">CARRIERA</span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-base sm:text-lg text-[#A6A6A6] leading-relaxed max-w-2xl font-normal">
            I tecnici fanno funzionare il mondo. Gyver li aiuta a costruire una carriera all&apos;altezza.
            Trasforma job offer complesse in annunci diretti, concreti e ad alto impatto per WhatsApp, Job Board e Social Ads.
          </p>

          {/* Primary Action Button */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="inline-flex items-center justify-center px-6 h-12 bg-[#FF4B1F] hover:bg-[#FF5525] text-white text-sm font-semibold rounded-lg shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.98]"
            >
              {isFormOpen ? 'Chiudi Form' : '+ Nuovo Annuncio'}
            </button>

            <a
              href="#elenco-annunci"
              className="inline-flex items-center justify-center px-5 h-12 bg-transparent hover:bg-[#181818] text-[#F5F5F5] border border-[#292929] hover:border-[#383838] text-sm font-medium rounded-lg transition-colors"
            >
              Esplora annunci ({advertisements.length})
            </a>
          </div>

          {/* Social Proof & Metrics */}
          <div className="pt-6 border-t border-[#292929]/70 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-extrabold text-[#F5F5F5] font-mono">25.000+</div>
              <div className="text-xs text-[#737373] uppercase tracking-wider mt-0.5">Tecnici nella Community</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#FF4B1F] font-mono">100%</div>
              <div className="text-xs text-[#737373] uppercase tracking-wider mt-0.5">Recruiting Verticale</div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-2xl font-extrabold text-[#F5F5F5] font-mono">0 Fuffa</div>
              <div className="text-xs text-[#737373] uppercase tracking-wider mt-0.5">Anti-corporate attitude</div>
            </div>
          </div>
        </div>
      </section>

      {/* Creation Form Panel (Collapsible) */}
      {isFormOpen && (
        <section className="transition-all duration-300">
          <AdvertisementForm
            jobOffers={jobOffers}
            onCancel={() => setIsFormOpen(false)}
          />
        </section>
      )}

      {/* Main Section: Filters & Advertisements List */}
      <section id="elenco-annunci" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#292929]">
          <div>
            <div className="text-xs font-mono text-[#FF4B1F] uppercase tracking-wider">Dashboard</div>
            <h2 className="text-2xl font-bold tracking-tight text-[#F5F5F5] mt-1">
              Annunci e Distribuzione Canali
            </h2>
            <p className="text-sm text-[#A6A6A6] mt-1">
              Filtra e gestisci gli annunci pubblicati e le varianti generate per ciascun canale.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <AdvertisementFilters
          jobOffers={jobOffers}
          selectedJobOfferId={selectedJobOfferId}
          selectedChannel={selectedChannel}
          onJobOfferChange={setSelectedJobOfferId}
          onChannelChange={setSelectedChannel}
          onReset={handleResetFilters}
          disabled={isLoading}
        />

        {/* Advertisements Table / Panel */}
        <AdvertisementList
          advertisements={advertisements}
          isLoading={isLoading}
          error={error}
          onRetry={fetchAdvertisements}
        />
      </section>
    </main>
  );
}