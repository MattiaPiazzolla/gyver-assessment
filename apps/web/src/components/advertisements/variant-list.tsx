'use client';

import { useState } from 'react';
import { AdvertisementVariant } from '@/types/api';
import { VariantEditForm } from './variant-edit-form';

interface VariantListProps {
  advertisementId: string;
  variants: AdvertisementVariant[];
  onRefresh: () => Promise<void>;
}

export function VariantList({ advertisementId, variants, onRefresh }: VariantListProps) {
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);

  if (variants.length === 0) {
    return (
      <div className="p-12 border border-dashed border-[#292929] rounded-2xl bg-[#111111] text-center text-[#A6A6A6]">
        <p className="text-sm font-mono">Nessuna variante disponibile per questo annuncio.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {variants.map((variant, index) => {
        const isEditing = editingVariantId === variant.id;

        if (isEditing) {
          return (
            <VariantEditForm
              key={variant.id}
              advertisementId={advertisementId}
              variant={variant}
              onSuccess={onRefresh}
              onCancel={() => setEditingVariantId(null)}
            />
          );
        }

        return (
          <div
            key={variant.id}
            className="border border-[#292929] rounded-xl p-6 bg-[#111111] hover:border-[#383838] transition-colors space-y-4"
          >
            {/* Header variante */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#292929]">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-[#F5F5F5] text-sm">
                  {variant.variantName || `Variante #${index + 1}`}
                </span>
                <span className="text-[11px] text-[#737373] font-mono">
                  ({variant.id.slice(0, 8)})
                </span>
              </div>

              <div className="flex items-center gap-3">
                {variant.isEdited ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-950/40 text-amber-400 border border-amber-900/60">
                    Modificata
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#181818] text-[#A6A6A6] border border-[#292929]">
                    Originale AI
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setEditingVariantId(variant.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#F5F5F5] bg-[#181818] hover:bg-[#222222] border border-[#292929] hover:border-[#383838] rounded-lg transition-colors cursor-pointer"
                >
                  Modifica
                </button>
              </div>
            </div>

            {/* Contenuto variante */}
            <div className="space-y-4 text-sm">
              {/* Headline */}
              <div>
                <span className="block text-[11px] font-mono font-semibold text-[#737373] uppercase tracking-wider mb-1.5">
                  {"// Headline"}
                </span>
                <p className="font-bold text-[#F5F5F5] text-base bg-[#181818] p-3.5 rounded-lg border border-[#222222]">
                  {variant.headline}
                </p>
              </div>

              {/* Body Text */}
              <div>
                <span className="block text-[11px] font-mono font-semibold text-[#737373] uppercase tracking-wider mb-1.5">
                  {"// Body Copy"}
                </span>
                <div className="text-[#D4D4D4] whitespace-pre-line bg-[#181818] p-4 rounded-lg border border-[#222222] font-normal leading-relaxed text-sm">
                  {variant.bodyText}
                </div>
              </div>

              {/* CTA */}
              <div>
                <span className="block text-[11px] font-mono font-semibold text-[#737373] uppercase tracking-wider mb-1.5">
                  {"// Call To Action"}
                </span>
                <div className="inline-flex items-center font-mono text-xs font-semibold text-[#FF4B1F] bg-[#FF4B1F]/10 px-3.5 py-2 rounded-lg border border-[#FF4B1F]/30">
                  <span>{variant.callToAction}</span>
                </div>
              </div>

              {/* Creative Notes */}
              {variant.creativeNotes && (
                <div>
                  <span className="block text-[11px] font-mono font-semibold text-[#737373] uppercase tracking-wider mb-1.5">
                    {"// Note Tecniche & Specifiche Canale"}
                  </span>
                  <p className="text-xs font-mono text-[#A6A6A6] bg-[#0D0D0D] p-3 rounded-lg border border-[#222222]">
                    {variant.creativeNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}