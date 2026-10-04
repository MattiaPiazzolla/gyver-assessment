'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api-client';
import { AdvertisementVariant, UpdateVariantPayload } from '@/types/api';

interface VariantEditFormProps {
  advertisementId: string;
  variant: AdvertisementVariant;
  onSuccess: () => Promise<void>;
  onCancel: () => void;
}

export function VariantEditForm({
  advertisementId,
  variant,
  onSuccess,
  onCancel,
}: VariantEditFormProps) {
  const [headline, setHeadline] = useState<string>(variant.headline);
  const [bodyText, setBodyText] = useState<string>(variant.bodyText);
  const [callToAction, setCallToAction] = useState<string>(variant.callToAction);
  const [creativeNotes, setCreativeNotes] = useState<string>(variant.creativeNotes || '');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload: UpdateVariantPayload = {
      headline: headline.trim(),
      bodyText: bodyText.trim(),
      callToAction: callToAction.trim(),
      creativeNotes: creativeNotes.trim() ? creativeNotes.trim() : null,
    };

    try {
      await api.updateVariant(advertisementId, variant.id, payload);
      await onSuccess();
      onCancel();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Errore durante il salvataggio delle modifiche.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-[#FF4B1F]/40 bg-[#111111] rounded-xl p-6 space-y-5"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#292929]">
        <div>
          <div className="text-[11px] font-mono text-[#FF4B1F] uppercase tracking-wider">
            {"// Modifica Manuale"}
          </div>
          <h4 className="text-sm font-bold text-[#F5F5F5] mt-0.5">
            {variant.variantName || 'Variante'}
          </h4>
        </div>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="text-xs font-mono text-[#737373] hover:text-[#F5F5F5] disabled:opacity-50"
        >
          Annulla &times;
        </button>
      </div>

      {error && (
        <div className="p-3 border border-red-900/60 bg-red-950/40 text-red-300 text-xs rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor={`headline-${variant.id}`}
          className="block text-xs font-mono font-medium text-[#A6A6A6] uppercase tracking-wider mb-2"
        >
          {"// Headline *"}
        </label>
        <input
          id={`headline-${variant.id}`}
          type="text"
          value={headline}
          disabled={isSubmitting}
          onChange={(e) => setHeadline(e.target.value)}
          required
          className="w-full px-3.5 py-2.5 text-sm border border-[#292929] rounded-lg bg-[#181818] text-[#F5F5F5] focus:border-[#FF4B1F] focus:ring-1 focus:ring-[#FF4B1F] focus:outline-none disabled:opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor={`bodyText-${variant.id}`}
          className="block text-xs font-mono font-medium text-[#A6A6A6] uppercase tracking-wider mb-2"
        >
          {"// Body Copy *"}
        </label>
        <textarea
          id={`bodyText-${variant.id}`}
          rows={6}
          value={bodyText}
          disabled={isSubmitting}
          onChange={(e) => setBodyText(e.target.value)}
          required
          className="w-full px-3.5 py-2.5 text-sm border border-[#292929] rounded-lg bg-[#181818] text-[#F5F5F5] focus:border-[#FF4B1F] focus:ring-1 focus:ring-[#FF4B1F] focus:outline-none disabled:opacity-50 font-normal leading-relaxed"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor={`cta-${variant.id}`}
            className="block text-xs font-mono font-medium text-[#A6A6A6] uppercase tracking-wider mb-2"
          >
            {"// Call To Action *"}
          </label>
          <input
            id={`cta-${variant.id}`}
            type="text"
            value={callToAction}
            disabled={isSubmitting}
            onChange={(e) => setCallToAction(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 text-sm border border-[#292929] rounded-lg bg-[#181818] text-[#F5F5F5] focus:border-[#FF4B1F] focus:ring-1 focus:ring-[#FF4B1F] focus:outline-none disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor={`notes-${variant.id}`}
            className="block text-xs font-mono font-medium text-[#A6A6A6] uppercase tracking-wider mb-2"
          >
            {"// Note Tecniche Canale (Opzionale)"}
          </label>
          <input
            id={`notes-${variant.id}`}
            type="text"
            value={creativeNotes}
            disabled={isSubmitting}
            onChange={(e) => setCreativeNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-[#292929] rounded-lg bg-[#181818] text-[#F5F5F5] focus:border-[#FF4B1F] focus:ring-1 focus:ring-[#FF4B1F] focus:outline-none disabled:opacity-50 font-mono text-xs"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-[#292929]">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-xs font-semibold text-[#A6A6A6] hover:text-[#F5F5F5] bg-transparent hover:bg-[#181818] border border-[#292929] rounded-lg transition-colors disabled:opacity-50"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#FF4B1F] hover:bg-[#FF5525] rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
        </button>
      </div>
    </form>
  );
}