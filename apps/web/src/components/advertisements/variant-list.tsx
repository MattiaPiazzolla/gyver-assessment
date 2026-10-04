'use client';

import { useId, useState, type KeyboardEvent } from 'react';
import Image from 'next/image';
import type { AdvertisementChannel, AdvertisementFormat, AdvertisementVariant } from '@/types/api';
import { getPostVisualAsset } from '@/lib/post-assets';
import { Modal } from '@/components/ui/modal';
import { VariantEditForm } from './variant-edit-form';
import { VariantPreview } from './variant-preview';

interface VariantListProps {
  advertisementId: string;
  variants: AdvertisementVariant[];
  channel?: AdvertisementChannel;
  format?: AdvertisementFormat;
  jobOfferTitle?: string;
  onRefresh: () => Promise<void>;
}

export function VariantList({ advertisementId, variants, channel, format, jobOfferTitle, onRefresh }: VariantListProps) {
  const [activeVariantId, setActiveVariantId] = useState<string | null>(variants[0]?.id ?? null);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [copiedVariantId, setCopiedVariantId] = useState<string | null>(null);
  const [activeModalImage, setActiveModalImage] = useState<string | null>(null);
  const tabGroupId = useId();

  const activeVariant = variants.find((variant) => variant.id === activeVariantId) ?? variants[0];
  const editingVariant = variants.find((variant) => variant.id === editingVariantId);

  const selectWithKeyboard = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % variants.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + variants.length) % variants.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = variants.length - 1;
    else return;

    event.preventDefault();
    setActiveVariantId(variants[nextIndex].id);
    const tabs = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs?.[nextIndex]?.focus();
  };

  const copyVariant = async () => {
    if (!navigator.clipboard) return;
    const text = `${activeVariant.headline}\n\n${activeVariant.bodyText}\n\nCTA: ${activeVariant.callToAction}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedVariantId(activeVariant.id);
      window.setTimeout(() => setCopiedVariantId((current) => current === activeVariant.id ? null : current), 2000);
    } catch {
      setCopiedVariantId(null);
    }
  };

  if (variants.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#292929] bg-[#111116]/60 p-8 text-center text-[#A6A6A6]">
        <p className="text-sm font-medium">Nessuna variante disponibile per questo annuncio.</p>
        <p className="mt-1 text-xs text-[#737373]">Crea una nuova variante con l&apos;AI per visualizzarla qui.</p>
      </div>
    );
  }

  const activeIndex = variants.findIndex((variant) => variant.id === activeVariant.id);
  const asset = getPostVisualAsset(format, channel, activeVariant.creativeNotes, jobOfferTitle);

  return (
    <div className="max-w-3xl space-y-4">
      <div role="tablist" aria-label="Versioni dell’annuncio" className="flex gap-1 overflow-x-auto border-b border-[#292929]">
        {variants.map((variant, index) => {
          const selected = variant.id === activeVariant.id;
          return (
            <button
              key={variant.id}
              type="button"
              role="tab"
              id={`${tabGroupId}-tab-${variant.id}`}
              aria-controls={`${tabGroupId}-panel`}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveVariantId(variant.id)}
              onKeyDown={(event) => selectWithKeyboard(event, index)}
              className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${selected ? 'border-[#EF3C00] text-white' : 'border-transparent text-[#8E8E93] hover:text-white'}`}
            >
              {variant.variantName || `Variante ${index + 1}`}
              {variant.isEdited && <span className="ml-2 text-xs text-amber-300" aria-label="Modificata">●</span>}
            </button>
          );
        })}
      </div>

      <section
        id={`${tabGroupId}-panel`}
        role="tabpanel"
        aria-labelledby={`${tabGroupId}-tab-${activeVariant.id}`}
        tabIndex={0}
        className="rounded-2xl border border-[#292929]/80 bg-[#111116]/80 p-4 sm:p-5"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#292929]/80 pb-4">
          <div>
            <p className="text-sm font-semibold text-white">{activeVariant.variantName || `Variante ${activeIndex + 1}`}</p>
            <p className="mt-0.5 text-xs text-[#8E8E93]">Anteprima del contenuto per il canale selezionato</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => void copyVariant()} className="btn-secondary cursor-pointer px-3 py-1.5 text-xs font-semibold">
              {copiedVariantId === activeVariant.id ? 'Copiato' : 'Copia testo'}
            </button>
            <button type="button" onClick={() => setEditingVariantId(activeVariant.id)} className="btn-secondary cursor-pointer px-3 py-1.5 text-xs font-semibold">Modifica</button>
          </div>
        </div>

        <div className="flex justify-center py-1">
          <VariantPreview variant={activeVariant} channel={channel} format={format} asset={asset} onOpenImage={setActiveModalImage} />
        </div>

        <details className="mt-5 border-t border-[#292929]/80 pt-4 text-sm">
          <summary className="cursor-pointer text-[#A6A6A6] transition-colors hover:text-white">Testo completo e note</summary>
          <div className="mt-4 space-y-3 text-[#D6D6DA]">
            <p className="font-semibold text-white">{activeVariant.headline}</p>
            <p className="whitespace-pre-line leading-relaxed">{activeVariant.bodyText}</p>
            <p className="font-medium text-[#FF9A78]">{activeVariant.callToAction}</p>
            {activeVariant.creativeNotes && <p className="border-t border-[#292929]/80 pt-3 text-xs leading-relaxed text-[#A6A6A6]">Note creative: {activeVariant.creativeNotes}</p>}
          </div>
        </details>
      </section>

      {editingVariant && (
        <VariantEditForm advertisementId={advertisementId} variant={editingVariant} onSuccess={onRefresh} onCancel={() => setEditingVariantId(null)} />
      )}

      {activeModalImage && (
        <Modal titleId="preview-image-title" onClose={() => setActiveModalImage(null)} className="max-w-2xl">
          <div className="flex items-center justify-between border-b border-[#292933] bg-[#16161f] px-5 py-3.5">
            <span id="preview-image-title" className="text-xs font-semibold text-white">Immagine dell’annuncio</span>
            <button type="button" onClick={() => setActiveModalImage(null)} className="px-2 py-1 text-lg leading-none text-[#8E8E93] hover:text-white" aria-label="Chiudi anteprima">&times;</button>
          </div>
          <div className="relative aspect-square max-h-[70dvh] w-full bg-black">
            <Image src={activeModalImage} alt="Immagine dell’annuncio a piena risoluzione" fill sizes="(max-width: 768px) 100vw, 672px" className="object-contain" />
          </div>
          <div className="flex justify-end border-t border-[#292933] bg-[#16161f] px-5 py-3">
            <a href={activeModalImage} download="immagine-annuncio.webp" className="btn-accent px-4 py-1.5 text-xs font-semibold">Scarica immagine</a>
          </div>
        </Modal>
      )}
    </div>
  );
}
