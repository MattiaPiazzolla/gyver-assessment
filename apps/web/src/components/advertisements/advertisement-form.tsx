'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
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

export function AdvertisementForm({
  isOpen,
  jobOffers,
  onClose,
}: AdvertisementFormProps) {
  const router = useRouter();

  const [jobOfferId, setJobOfferId] = useState<string>(jobOffers[0]?.id || '');
  const [channel, setChannel] = useState<AdvertisementChannel>('JOB_BOARD');
  const [format, setFormat] = useState<AdvertisementFormat>('JOB_POSTING');
  const [targetLocation, setTargetLocation] = useState<string>('');
  const [variantGoals, setVariantGoals] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Aggiorna la jobOfferId di default se le jobOffers cambiano
  useEffect(() => {
    if (!jobOfferId && jobOffers.length > 0) {
      setJobOfferId(jobOffers[0].id);
    }
  }, [jobOffers, jobOfferId]);

  // Gestione tasto ESC e blocco scroll quando il popup è aperto
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!jobOfferId) {
      setError('Seleziona una Job Offer valida.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: CreateAdvertisementPayload = {
      jobOfferId,
      channel,
      format,
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
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#111111] border border-[#292929] rounded-2xl shadow-2xl p-6 sm:p-8 my-auto space-y-6"
      >
        {/* Header Modal */}
        <div className="flex items-start justify-between pb-4 border-b border-[#292929]">
          <div>
            <div className="text-[11px] font-mono text-[#FF4B1F] uppercase tracking-wider">
              {"// Generazione Annuncio"}
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#F5F5F5] mt-0.5">
              Nuovo Annuncio Multicanale
            </h2>
            <p className="text-xs text-[#A6A6A6] mt-1">
              Seleziona la Job Offer e il canale per generare testi ottimizzati con l&apos;AI.
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Job Offer */}
            <div className="md:col-span-2">
              <label
                htmlFor="jobOfferId"
                className="block text-xs font-mono font-medium text-[#A6A6A6] uppercase tracking-wider mb-2"
              >
                Job Offer di Origine *
              </label>
              <select
                id="jobOfferId"
                value={jobOfferId}
                disabled={isSubmitting}
                onChange={(e) => setJobOfferId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-[#292929] rounded-lg bg-[#181818] text-[#F5F5F5] focus:border-[#FF4B1F] focus:ring-1 focus:ring-[#FF4B1F] focus:outline-none disabled:opacity-50"
                required
              >
                {jobOffers.map((job) => {
                  const loc =
                    job.default_location ||
                    job.defaultLocation ||
                    job.location ||
                    'Sede aziendale';
                  return (
                    <option key={job.id} value={job.id} className="bg-[#181818] text-[#F5F5F5]">
                      {job.title} — {loc}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Canale */}
            <div>
              <label
                htmlFor="channel"
                className="block text-xs font-mono font-medium text-[#A6A6A6] uppercase tracking-wider mb-2"
              >
                Canale di Destinazione *
              </label>
              <select
                id="channel"
                value={channel}
                disabled={isSubmitting}
                onChange={(e) => {
                  const val = e.target.value as AdvertisementChannel;
                  setChannel(val);
                  if (val === 'WHATSAPP') setFormat('MESSAGE');
                  else if (val === 'INSTAGRAM') setFormat('FEED_POST');
                  else if (val === 'TIKTOK') setFormat('STORY');
                  else setFormat('JOB_POSTING');
                }}
                className="w-full px-3.5 py-2.5 text-sm border border-[#292929] rounded-lg bg-[#181818] text-[#F5F5F5] focus:border-[#FF4B1F] focus:ring-1 focus:ring-[#FF4B1F] focus:outline-none disabled:opacity-50 font-mono"
                required
              >
                <option value="JOB_BOARD" className="bg-[#181818] text-[#F5F5F5]">JOB_BOARD (es. Indeed)</option>
                <option value="WHATSAPP" className="bg-[#181818] text-[#F5F5F5]">WHATSAPP (Chat & Anteprima A4)</option>
                <option value="INSTAGRAM" className="bg-[#181818] text-[#F5F5F5]">INSTAGRAM (Social Feed)</option>
                <option value="TIKTOK" className="bg-[#181818] text-[#F5F5F5]">TIKTOK (Video Hook)</option>
              </select>
            </div>

            {/* Formato */}
            <div>
              <label
                htmlFor="format"
                className="block text-xs font-mono font-medium text-[#A6A6A6] uppercase tracking-wider mb-2"
              >
                Formato *
              </label>
              <select
                id="format"
                value={format}
                disabled={isSubmitting}
                onChange={(e) => setFormat(e.target.value as AdvertisementFormat)}
                className="w-full px-3.5 py-2.5 text-sm border border-[#292929] rounded-lg bg-[#181818] text-[#F5F5F5] focus:border-[#FF4B1F] focus:ring-1 focus:ring-[#FF4B1F] focus:outline-none disabled:opacity-50 font-mono"
                required
              >
                <option value="JOB_POSTING" className="bg-[#181818] text-[#F5F5F5]">JOB_POSTING (Testo strutturato)</option>
                <option value="MESSAGE" className="bg-[#181818] text-[#F5F5F5]">MESSAGE (Chat mobile rapida)</option>
                <option value="FEED_POST" className="bg-[#181818] text-[#F5F5F5]">FEED_POST (Visual 1080x1080)</option>
                <option value="STORY" className="bg-[#181818] text-[#F5F5F5]">STORY (Hook verticale)</option>
              </select>
            </div>

            {/* Target Location */}
            <div>
              <label
                htmlFor="targetLocation"
                className="block text-xs font-mono font-medium text-[#A6A6A6] uppercase tracking-wider mb-2"
              >
                Sede Target per questo annuncio
              </label>
              <input
                id="targetLocation"
                type="text"
                placeholder="es. Brescia e provincia"
                value={targetLocation}
                disabled={isSubmitting}
                onChange={(e) => setTargetLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-[#292929] rounded-lg bg-[#181818] text-[#F5F5F5] placeholder-[#737373] focus:border-[#FF4B1F] focus:ring-1 focus:ring-[#FF4B1F] focus:outline-none disabled:opacity-50"
              />
            </div>

            {/* Variant Goals */}
            <div>
              <label
                htmlFor="variantGoals"
                className="block text-xs font-mono font-medium text-[#A6A6A6] uppercase tracking-wider mb-2"
              >
                Obiettivo o Focus (Opzionale)
              </label>
              <input
                id="variantGoals"
                type="text"
                placeholder="es. Focus su trasferte pagate e stabilità"
                value={variantGoals}
                disabled={isSubmitting}
                onChange={(e) => setVariantGoals(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-[#292929] rounded-lg bg-[#181818] text-[#F5F5F5] placeholder-[#737373] focus:border-[#FF4B1F] focus:ring-1 focus:ring-[#FF4B1F] focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Footer Modal Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#292929]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 h-11 text-xs font-semibold text-[#A6A6A6] hover:text-[#F5F5F5] bg-transparent hover:bg-[#181818] border border-[#292929] rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-11 bg-[#FF4B1F] hover:bg-[#FF5525] text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/20 border-t-white" />
                  <span>Generazione in corso...</span>
                </>
              ) : (
                <span>Genera Annuncio & Varianti</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}