import Image from 'next/image';
import type { AdvertisementChannel, AdvertisementFormat, AdvertisementVariant } from '@/types/api';
import type { PostVisualAsset } from '@/lib/post-assets';

interface VariantPreviewProps {
  variant: AdvertisementVariant;
  channel?: AdvertisementChannel;
  format?: AdvertisementFormat;
  asset: PostVisualAsset | null;
  onOpenImage: (src: string) => void;
}

function PreviewImage({ asset, onOpenImage, className = '' }: {
  asset: PostVisualAsset | null;
  onOpenImage: (src: string) => void;
  className?: string;
}) {
  if (!asset) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-[#202535] to-[#101116] px-8 text-center text-sm text-[#A6A6A6] ${className}`}>
        Visual non disponibile
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpenImage(asset.src)}
      aria-label="Apri l’immagine dell’annuncio"
      className={`group relative block overflow-hidden ${className}`}
    >
      <Image src={asset.src} alt={asset.alt} fill sizes="(max-width: 640px) 100vw, 440px" className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
    </button>
  );
}

function FeedPreview({ variant, asset, onOpenImage }: VariantPreviewProps) {
  return (
    <div className="w-full max-w-[390px] overflow-hidden rounded-2xl border border-[#34343a] bg-[#101014] text-white shadow-lg">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-xs font-bold">G</div>
        <div className="min-w-0 text-xs"><p className="font-semibold">gyver</p><p className="text-[#92929a]">Anteprima post</p></div>
        <span aria-hidden="true" className="ml-auto text-lg leading-none">···</span>
      </div>
      <PreviewImage asset={asset} onOpenImage={onOpenImage} className="aspect-square w-full" />
      <div className="px-4 py-3">
        <div aria-hidden="true" className="flex items-center gap-4 text-xl leading-none"><span>♡</span><span>◯</span><span>↗</span><span className="ml-auto">⌑</span></div>
        <p className="mt-3 text-sm leading-relaxed"><span className="font-semibold">gyver</span> <span className="font-semibold">{variant.headline}</span></p>
        <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-[#D6D6DC]">{variant.bodyText}</p>
        <div className="mt-3 border-t border-white/10 pt-3 text-sm font-semibold text-[#9abfff]">{variant.callToAction} <span aria-hidden="true">→</span></div>
      </div>
    </div>
  );
}

function StoryPreview({ variant, channel, asset, onOpenImage }: VariantPreviewProps) {
  const isTikTok = channel === 'TIKTOK';

  return (
    <div className="relative aspect-[9/16] max-h-[580px] w-full max-w-[326px] overflow-hidden rounded-[26px] border border-[#34343a] bg-[#161820] text-white shadow-lg">
      {asset ? (
        <button type="button" onClick={() => onOpenImage(asset.src)} aria-label="Apri l’immagine dell’annuncio" className="absolute inset-0">
          <Image src={asset.src} alt={asset.alt} fill sizes="326px" className="object-cover" />
        </button>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#34415a] via-[#1b2632] to-[#101116] text-xs text-white/60">Visual non disponibile</div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/90" />
      <div className="pointer-events-none absolute inset-x-0 top-0 px-4 pt-4 text-xs font-semibold">
        {isTikTok ? 'TikTok · Anteprima video' : 'gyver · Storia'}
      </div>
      {isTikTok && <div aria-hidden="true" className="pointer-events-none absolute bottom-24 right-4 flex flex-col gap-4 text-xl">♡<span>◯</span><span>↗</span></div>}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 pr-12">
        <p className="text-lg font-bold leading-snug drop-shadow-md">{variant.headline}</p>
        <p className="mt-1 line-clamp-3 whitespace-pre-line text-xs leading-relaxed text-white/90 drop-shadow-md">{variant.bodyText}</p>
        <span className="mt-3 inline-block max-w-full truncate rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#151515]">{variant.callToAction}</span>
      </div>
    </div>
  );
}

function WhatsAppPreview({ variant }: VariantPreviewProps) {
  return (
    <div className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-[#294036] bg-[#0b141a] shadow-lg">
      <div className="flex items-center gap-3 bg-[#202c33] px-4 py-3">
        <div className="flex size-8 items-center justify-center rounded-full bg-[#547d70] text-xs font-bold text-white">G</div>
        <div><p className="text-sm font-semibold text-white">Gyver</p><p className="text-[11px] text-[#aebac1]">Anteprima messaggio</p></div>
      </div>
      <div className="min-h-44 bg-[radial-gradient(circle_at_20%_10%,#1c3431,transparent_55%)] px-4 py-5">
        <div className="ml-auto max-h-80 w-fit max-w-[95%] overflow-y-auto rounded-xl rounded-tr-sm bg-[#005c4b] px-3.5 py-3 text-sm leading-relaxed text-white [scrollbar-color:#5c8c7e_transparent] [scrollbar-width:thin]" tabIndex={0} aria-label="Testo del messaggio, scorri per leggere tutto">
          <p className="font-semibold">{variant.headline}</p>
          <p className="mt-2 whitespace-pre-line">{variant.bodyText}</p>
          <p className="mt-3 font-medium text-[#c0f5e1]">{variant.callToAction}</p>
        </div>
      </div>
      <div className="bg-[#202c33] px-4 py-2 text-xs text-[#aebac1]">Anteprima · Nessun messaggio inviato</div>
    </div>
  );
}

function JobBoardPreview({ variant }: VariantPreviewProps) {
  return (
    <div className="w-full max-w-[560px] rounded-2xl border border-[#dce1e6] bg-white p-5 text-[#20252b] shadow-lg sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#68747f]">Offerta di lavoro</p>
      <h3 className="mt-2 text-xl font-bold leading-snug">{variant.headline}</h3>
      <div className="mt-4 border-t border-[#e4e7ea] pt-4">
        <p className="max-h-44 overflow-y-auto whitespace-pre-line text-sm leading-relaxed text-[#3e4851] [scrollbar-color:#c4cbd1_transparent] [scrollbar-width:thin]" tabIndex={0} aria-label="Descrizione dell’offerta, scorri per leggere tutto">{variant.bodyText}</p>
      </div>
      <div className="mt-5 inline-flex max-w-full rounded-lg bg-[#2463a6] px-4 py-2 text-sm font-semibold text-white">{variant.callToAction}</div>
    </div>
  );
}

export function VariantPreview(props: VariantPreviewProps) {
  if (props.channel === 'WHATSAPP' || props.format === 'MESSAGE') return <WhatsAppPreview {...props} />;
  if (props.channel === 'TIKTOK' || props.format === 'STORY') return <StoryPreview {...props} />;
  if (props.channel === 'INSTAGRAM' || props.format === 'FEED_POST') return <FeedPreview {...props} />;
  return <JobBoardPreview {...props} />;
}
