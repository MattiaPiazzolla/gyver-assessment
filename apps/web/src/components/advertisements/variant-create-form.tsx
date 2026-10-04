'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api-client';
import { AdvertisementDetail } from '@/types/api';

interface VariantCreateFormProps {
  advertisementId: string;
  onSuccess: (updatedAd: AdvertisementDetail) => void;
}

export function VariantCreateForm({ advertisementId, onSuccess }: VariantCreateFormProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [variantGoals, setVariantGoals] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center px-4 py-2 bg-[#FF4B1F] hover:bg-[#FF5525] text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
      >
        + Nuova Variante (AI)
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-[#292929] bg-[#111111] rounded-xl p-5 space-y-4"
    >
      <div className="flex items-center justify-between pb-2 border-b border-[#292929]">
        <div>
          <div className="text-[11px] font-mono text-[#FF4B1F] uppercase tracking-wider">
            {"// Prompt AI"}
          </div>
          <h3 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider mt-0.5">
            Genera Nuova Variante con AI
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          disabled={isSubmitting}
          className="text-xs font-mono text-[#737373] hover:text-[#F5F5F5] disabled:opacity-50"
        >
          Chiudi &times;
        </button>
      </div>

      {error && (
        <div className="p-3 border border-red-900/60 bg-red-950/40 text-red-300 text-xs rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="variantGoals"
          className="block text-xs font-mono font-medium text-[#A6A6A6] uppercase tracking-wider mb-2"
        >
          {"// Obiettivo specifico o tono per questa variante (Opzionale)"}
        </label>
        <input
          id="variantGoals"
          type="text"
          placeholder="es. Tono più diretto, focus su trasferte pagate e stabilità contrattuale"
          value={variantGoals}
          disabled={isSubmitting}
          onChange={(e) => setVariantGoals(e.target.value)}
          className="w-full px-3.5 py-2.5 text-sm border border-[#292929] rounded-lg bg-[#181818] text-[#F5F5F5] placeholder-[#737373] focus:border-[#FF4B1F] focus:ring-1 focus:ring-[#FF4B1F] focus:outline-none disabled:opacity-50"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-[#292929]">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          disabled={isSubmitting}
          className="px-4 py-2 text-xs font-semibold text-[#A6A6A6] hover:text-[#F5F5F5] bg-transparent hover:bg-[#181818] border border-[#292929] rounded-lg transition-colors disabled:opacity-50"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center px-5 py-2 text-xs font-semibold text-white bg-[#FF4B1F] hover:bg-[#FF5525] rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/20 border-t-white" />
              <span>Generazione...</span>
            </>
          ) : (
            <span>Genera Variante</span>
          )}
        </button>
      </div>
    </form>
  );
}