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
    void fetchJobOffers();
  }, [fetchJobOffers]);

  useEffect(() => {
    void fetchAdvertisements();
  }, [fetchAdvertisements]);

  const handleResetFilters = () => {
    setSelectedJobOfferId('');
    setSelectedChannel('');
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Brand Hero Section with Glowing Gradient & Pulsing Glow */}
      <section className="hero rounded-2xl border border-[#292929] p-8 sm:p-12 lg:p-16">
        <div className="max-w-3xl space-y-6">
          {/* Large Headline with Animated Gradient & Letter-by-letter entrance */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.02em] leading-[1.02] text-[#F5F5F5] uppercase">
            LA TUA PROSSIMA<br />
            OPPORTUNITÀ DI<br />
            <span className="hero-title word-accent inline-block">
              {"CARRIERA".split("").map((ch, i) => (
                <span
                  key={i}
                  className="ch"
                  style={{ animationDelay: `${i * 0.045}s` }}
                >
                  {ch}
                </span>
              ))}
            </span>
          </h1>

          {/* Supporting Copy with reveal d1 */}
          <div className="reveal d1 space-y-2 max-w-2xl">
            <p className="text-base sm:text-lg text-[#F5F5F5] font-medium leading-relaxed">
              I tecnici tengono acceso il mondo. Gyver si prende cura della loro carriera.
            </p>
            <p className="text-sm sm:text-base text-[#A6A6A6] leading-relaxed font-normal">
              Trasformiamo offerte di lavoro complesse in annunci chiari, concreti e ad alto impatto &mdash; pronti per WhatsApp, Job Board e Social.
            </p>
          </div>

          {/* Micro-copy / CTAs with reveal d2 and btn-primary */}
          <div className="reveal d2 pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
            <a
              href="#elenco-annunci"
              className="btn-primary inline-flex items-center justify-center cursor-pointer"
            >
              Scopri le offerte
            </a>

            <a
              href="https://wa.me/?text=Ciao%20Gyver!"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 h-12 bg-transparent hover:bg-[#141417] text-[#F5F5F5] border border-[#292929] hover:border-[#383838] text-sm font-medium rounded-lg transition-colors"
            >
              Scrivici su WhatsApp &rarr;
            </a>

            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center justify-center px-5 h-12 bg-[#141417] hover:bg-[#1f1f23] text-[#A6A6A6] hover:text-[#F5F5F5] border border-[#292929] hover:border-[#383838] text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              + Nuovo Annuncio
            </button>
          </div>

          {/* Social Proof & Three Metrics with reveal d3 */}
          <div className="reveal d3 pt-6 border-t border-[#292929]/70 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-extrabold text-[#F5F5F5] font-mono">25.000+</div>
              <div className="text-xs text-[#A6A6A6] mt-1">Tecnici nella community</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#FF6A00] font-mono">100%</div>
              <div className="text-xs text-[#A6A6A6] mt-1">Recruiting verticale sul mondo elettrico</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#F5F5F5] font-mono">Sempre</div>
              <div className="text-xs text-[#A6A6A6] mt-1">Al tuo fianco, su WhatsApp</div>
            </div>
          </div>
        </div>
      </section>

      {/* Creation Form Modal Popup */}
      <AdvertisementForm
        isOpen={isFormOpen}
        jobOffers={jobOffers}
        onClose={() => setIsFormOpen(false)}
      />

      {/* Main Section: Filters & Advertisements List */}
      <section id="elenco-annunci" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#292929]">
          <div>
            <div className="text-xs font-mono text-[#FF4B1F] uppercase tracking-wider">Dashboard</div>
            <h2 className="text-2xl font-bold tracking-tight text-[#F5F5F5] mt-1">
              Offerte e Distribuzione Annunci
            </h2>
            <p className="text-sm text-[#A6A6A6] mt-1">
              Tutte le posizioni aperte e gli annunci ottimizzati per ciascun canale.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="self-start sm:self-auto inline-flex items-center justify-center px-4 py-2.5 bg-[#FF4B1F] hover:bg-[#FF5525] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            + Nuovo Annuncio
          </button>
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