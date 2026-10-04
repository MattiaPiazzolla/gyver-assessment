'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api-client';
import { AdvertisementDetail } from '@/types/api';
import { Modal } from '@/components/ui/modal';

interface VariantCreateFormProps {
  advertisementId: string;
  onSuccess: (updatedAd: AdvertisementDetail) => void;
}

export function VariantCreateForm({ advertisementId, onSuccess }: VariantCreateFormProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [variantGoals, setVariantGoals] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setError(null);
    setIsOpen(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const updatedAd = await api.createVariant(advertisementId, {
        ...(variantGoals.trim() ? { variantGoals: variantGoals.trim() } : {}),
      });
      setVariantGoals('');
      setIsOpen(false);
      onSuccess(updatedAd);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Si è verificato un errore durante la generazione della variante.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn-accent !rounded-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold cursor-pointer shadow-lg hover:brightness-110 transition-all self-start sm:self-auto"
      >
        <span className="text-sm font-bold leading-none">+</span>
        <span>Nuova Variante (AI)</span>
      </button>

      {isOpen && (
        <Modal titleId="create-variant-title" onClose={close} busy={isSubmitting} className="max-w-lg">
            {/* Header del Popup */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#292933] bg-[#16161f]">
              <div>
                <div className="text-[11px] font-semibold text-[#EF3C00] uppercase tracking-wider">
                  Generazione Assistita AI
                </div>
                <h3 id="create-variant-title" className="text-base font-bold text-white tracking-tight mt-0.5">
                  Nuova Variante Annuncio
                </h3>
              </div>
              <button
                type="button"
                onClick={close}
                disabled={isSubmitting}
                className="text-[#8E8E93] hover:text-white text-xl leading-none px-2 py-1 rounded cursor-pointer disabled:opacity-50 transition-colors"
                aria-label="Chiudi finestra"
              >
                &times;
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-3.5 border border-red-900/60 bg-red-950/40 text-red-300 text-xs rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="variantGoals"
                  className="block text-xs font-semibold text-[#A6A6A6] mb-1.5"
                >
                  Obiettivo specifico o tono per questa variante (opzionale)
                </label>
                <textarea
                  id="variantGoals"
                  data-auto-focus
                  rows={3}
                  placeholder="es. Tono più diretto, focus su trasferte pagate, stabilità del contratto a tempo indeterminato e welfare aziendale"
                  value={variantGoals}
                  disabled={isSubmitting}
                  onChange={(e) => setVariantGoals(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-[#2a2b36] rounded-xl bg-[#18181f] text-white placeholder-[#73737d] focus:border-[#EF3C00] focus:ring-1 focus:ring-[#EF3C00] focus:outline-none disabled:opacity-50 resize-none transition-colors"
                />
                <p className="text-[11px] text-[#73737d] mt-1.5 leading-relaxed">
                  L&apos;AI analizzerà i requisiti della Job Offer e genererà una nuova combinazione Headline, Body copy e Call To Action ottimizzata per il canale.
                </p>
              </div>

              {/* Azioni Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#292933]">
                <button
                  type="button"
                  onClick={close}
                  disabled={isSubmitting}
                  className="btn-secondary px-4 py-2 text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-accent inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/20 border-t-white" />
                      <span>Generazione AI in corso...</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>Genera Variante</span>
                    </>
                  )}
                </button>
              </div>
            </form>
        </Modal>
      )}
    </>
  );
}
