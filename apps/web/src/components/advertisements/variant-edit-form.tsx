'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api-client';
import { AdvertisementVariant, UpdateVariantPayload } from '@/types/api';
import { Modal } from '@/components/ui/modal';

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
    <Modal titleId={`edit-variant-${variant.id}`} onClose={onCancel} busy={isSubmitting} className="max-w-2xl">
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-8 space-y-6"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#292933]">
        <div>
          <div className="text-xs font-semibold text-[#EF3C00] uppercase tracking-wider">
            Modifica Manuale
          </div>
          <h4 id={`edit-variant-${variant.id}`} className="text-base font-bold text-white tracking-tight mt-0.5">
            {variant.variantName || 'Variante'}
          </h4>
        </div>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="text-xs text-[#8E8E93] hover:text-white disabled:opacity-50 transition-colors"
        >
          Annulla &times;
        </button>
      </div>

      {error && (
        <div className="p-3.5 border border-red-900/60 bg-red-950/40 text-red-300 text-xs rounded-xl">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor={`headline-${variant.id}`}
          className="block text-xs font-semibold text-[#A6A6A6] mb-1.5"
        >
          Headline *
        </label>
        <input
          id={`headline-${variant.id}`}
          data-auto-focus
          type="text"
          value={headline}
          disabled={isSubmitting}
          onChange={(e) => setHeadline(e.target.value)}
          required
          className="w-full px-4 py-2.5 text-sm border border-[#2a2b36] rounded-xl bg-[#18181f] text-white focus:border-[#EF3C00] focus:ring-1 focus:ring-[#EF3C00] focus:outline-none disabled:opacity-50 transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor={`bodyText-${variant.id}`}
          className="block text-xs font-semibold text-[#A6A6A6] mb-1.5"
        >
          Testo Annuncio (Body) *
        </label>
        <textarea
          id={`bodyText-${variant.id}`}
          rows={6}
          value={bodyText}
          disabled={isSubmitting}
          onChange={(e) => setBodyText(e.target.value)}
          required
          className="w-full px-4 py-3 text-sm border border-[#2a2b36] rounded-xl bg-[#18181f] text-white focus:border-[#EF3C00] focus:ring-1 focus:ring-[#EF3C00] focus:outline-none disabled:opacity-50 font-normal leading-relaxed transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor={`cta-${variant.id}`}
            className="block text-xs font-semibold text-[#A6A6A6] mb-1.5"
          >
            Call To Action *
          </label>
          <input
            id={`cta-${variant.id}`}
            type="text"
            value={callToAction}
            disabled={isSubmitting}
            onChange={(e) => setCallToAction(e.target.value)}
            required
            className="w-full px-4 py-2.5 text-sm border border-[#2a2b36] rounded-xl bg-[#18181f] text-white focus:border-[#EF3C00] focus:ring-1 focus:ring-[#EF3C00] focus:outline-none disabled:opacity-50 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor={`notes-${variant.id}`}
            className="block text-xs font-semibold text-[#A6A6A6] mb-1.5"
          >
            Note Tecniche Canale (opzionale)
          </label>
          <input
            id={`notes-${variant.id}`}
            type="text"
            value={creativeNotes}
            disabled={isSubmitting}
            onChange={(e) => setCreativeNotes(e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-[#2a2b36] rounded-xl bg-[#18181f] text-white focus:border-[#EF3C00] focus:ring-1 focus:ring-[#EF3C00] focus:outline-none disabled:opacity-50 font-mono text-xs transition-colors"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-[#292933]">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="btn-secondary px-4 py-2 text-xs font-semibold disabled:opacity-50 cursor-pointer"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-accent inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
        </button>
      </div>
    </form>
    </Modal>
  );
}
