'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Modal } from '@/components/ui/modal';
import { ChannelIcon, channelOptions } from './advertisement-display';
import {
  AdvertisementChannel,
  AdvertisementFormat,
  CreateAdvertisementPayload,
  JobOfferSummary,
} from '@/types/api';

interface AdvertisementFormProps {
  isOpen: boolean;
  jobOffers: JobOfferSummary[];
  onClose: () => void;
}

const defaultFormatByChannel: Record<AdvertisementChannel, AdvertisementFormat> = {
  JOB_BOARD: 'JOB_POSTING',
  WHATSAPP: 'MESSAGE',
  INSTAGRAM: 'FEED_POST',
  TIKTOK: 'STORY',
};

export function AdvertisementForm({
  isOpen,
  jobOffers,
  onClose,
}: AdvertisementFormProps) {
  const router = useRouter();

  const [jobOfferId, setJobOfferId] = useState<string>(jobOffers[0]?.id || '');
  const [channel, setChannel] = useState<AdvertisementChannel>('JOB_BOARD');
  const [targetLocation, setTargetLocation] = useState<string>('');
  const [variantGoals, setVariantGoals] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Aggiorna la jobOfferId di default se le jobOffers cambiano
  useEffect(() => {
    if (jobOffers.length > 0 && !jobOffers.some((job) => job.id === jobOfferId)) {
      setJobOfferId(jobOffers[0].id);
    }
  }, [jobOffers, jobOfferId]);

  if (!isOpen) return null;

  const selectedJobOffer = jobOffers.find((job) => job.id === jobOfferId);
  const jobLocation = selectedJobOffer?.default_location || selectedJobOffer?.defaultLocation || selectedJobOffer?.location;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!jobOfferId) {
      setError('Seleziona una posizione valida.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: CreateAdvertisementPayload = {
      jobOfferId,
      channel,
      format: defaultFormatByChannel[channel],
      ...(targetLocation.trim() ? { targetLocation: targetLocation.trim() } : {}),
      ...(variantGoals.trim() ? { variantGoals: variantGoals.trim() } : {}),
    };

    try {
      const createdAd = await api.createAdvertisement(payload);
      onClose();
      router.push(`/advertisements/${createdAd.id}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Si è verificato un errore durante la generazione dell’annuncio.');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <Modal titleId="create-ad-title" onClose={onClose} busy={isSubmitting} className="max-w-2xl space-y-5 p-5 sm:p-7">
        {/* Header Modal */}
        <div className="flex items-start justify-between gap-4 border-b border-[#292929] pb-4">
          <div>
            <h2 id="create-ad-title" className="text-xl font-bold tracking-tight text-[#F5F5F5]">
              Nuovo annuncio
            </h2>
            <p className="mt-1 text-sm text-[#A6A6A6]">
              Scegli la posizione e dove pubblicarla.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Chiudi finestra"
            className="p-1.5 text-[#737373] hover:text-[#F5F5F5] hover:bg-[#181818] rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="p-4 border border-red-900/60 bg-red-950/40 text-red-300 text-xs rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-200 text-sm font-bold ml-2 cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Job Offer */}
            <div className="sm:col-span-2">
              <label
                htmlFor="jobOfferId"
                className="mb-1.5 block text-xs font-semibold text-[#A6A6A6]"
              >
                Posizione <span className="text-[#EF3C00]">*</span>
              </label>
              <div className="select-control">
                <select
                  id="jobOfferId"
                  data-auto-focus
                  value={jobOfferId}
                  disabled={isSubmitting || jobOffers.length === 0}
                  onChange={(e) => setJobOfferId(e.target.value)}
                  aria-describedby={jobLocation ? 'selected-job-location' : undefined}
                  className="h-11 w-full rounded-xl border border-[#383842] bg-[#18181f] px-3.5 text-sm text-white disabled:opacity-50"
                  required
                >
                  {jobOffers.length === 0 && <option value="">Nessuna posizione disponibile</option>}
                  {jobOffers.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
                </select>
              </div>
              {jobLocation && <p id="selected-job-location" className="mt-1.5 text-xs leading-relaxed text-[#A6A6A6]">Sede della posizione: <span className="text-[#D6D6DA]">{jobLocation}</span></p>}
            </div>

            {/* Canale */}
            <div className="sm:col-span-2">
              <p id="create-channel-label" className="mb-1.5 text-xs font-semibold text-[#A6A6A6]">Canale <span className="text-[#EF3C00]">*</span></p>
              <div role="group" aria-labelledby="create-channel-label" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {channelOptions.map(({ value, label, description }) => (
                  <button
                    key={value}
                    type="button"
                    disabled={isSubmitting}
                    aria-pressed={channel === value}
                    onClick={() => setChannel(value)}
                    className={`flex min-h-16 flex-col items-start justify-center gap-0.5 rounded-xl border px-3 py-2 text-left transition-colors disabled:opacity-50 ${channel === value ? 'border-[#EF3C00] bg-[#EF3C00]/10 text-white' : 'border-[#383842] bg-[#18181F] text-[#BDBDC3] hover:border-[#6A6A72]'}`}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold"><ChannelIcon channel={value} />{label}</span>
                    <span className="text-[11px] text-[#A6A6A6]">{description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Location */}
            <div>
              <label
                htmlFor="targetLocation"
                className="mb-1.5 block text-xs font-semibold text-[#A6A6A6]"
              >
                Area di diffusione <span className="font-normal text-[#73737D]">(facoltativa)</span>
              </label>
              <input
                id="targetLocation"
                type="text"
                placeholder="Es. Brescia e provincia"
                value={targetLocation}
                disabled={isSubmitting}
                onChange={(e) => setTargetLocation(e.target.value)}
                maxLength={255}
                aria-describedby="targetLocation-help"
                className="h-11 w-full rounded-xl border border-[#383842] bg-[#18181f] px-3.5 text-sm text-white placeholder:text-[#73737D] disabled:opacity-50"
              />
              <p id="targetLocation-help" className="mt-1.5 text-xs text-[#8E8E93]">Se vuota, useremo la sede della posizione.</p>
            </div>

            {/* Variant Goals */}
            <div>
              <label
                htmlFor="variantGoals"
                className="mb-1.5 block text-xs font-semibold text-[#A6A6A6]"
              >
                Cosa mettere in evidenza? <span className="font-normal text-[#73737D]">(facoltativo)</span>
              </label>
              <textarea
                id="variantGoals"
                rows={2}
                placeholder="Es. Trasferte pagate e stabilità"
                value={variantGoals}
                disabled={isSubmitting}
                onChange={(e) => setVariantGoals(e.target.value)}
                maxLength={500}
                className="min-h-20 w-full resize-y rounded-xl border border-[#383842] bg-[#18181f] px-3.5 py-2.5 text-sm text-white placeholder:text-[#73737D] disabled:opacity-50"
              />
            </div>
          </div>

          {/* Footer Modal Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#292929]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary w-full sm:w-auto px-5 h-11 text-xs font-semibold disabled:opacity-50 cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting || jobOffers.length === 0}
              className="btn-accent w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-11 text-xs font-semibold disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/20 border-t-white" />
                  <span>Generazione in corso...</span>
                </>
              ) : (
                <span>Genera annuncio</span>
              )}
            </button>
          </div>
        </form>
    </Modal>
  );
}
