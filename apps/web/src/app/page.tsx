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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
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
            <div className="text-xs font-semibold text-[#EF3C00] uppercase tracking-wider">Dashboard Operativa</div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F5] mt-1">
              Offerte e Distribuzione Annunci
            </h1>
            <p className="text-sm text-[#A6A6A6] mt-1">
              Tutte le posizioni aperte e gli annunci ottimizzati per ciascun canale.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="btn-accent self-start sm:self-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold cursor-pointer"
          >
            <span className="text-sm font-bold leading-none">+</span>
            <span>Nuovo Annuncio</span>
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