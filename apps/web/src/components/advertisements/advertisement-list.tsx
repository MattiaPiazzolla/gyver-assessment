import Link from 'next/link';
import { AdvertisementListItem } from '@/types/api';
import { ChannelBadge, formatLabels, StatusBadge } from './advertisement-display';

interface AdvertisementListProps {
  advertisements: AdvertisementListItem[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function AdvertisementList({ advertisements, isLoading, error, onRetry }: AdvertisementListProps) {
  if (isLoading) return <div role="status" className="flex flex-col items-center justify-center rounded-2xl border border-[#292929] bg-[#111116] p-16 text-[#A6A6A6]"><div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#292929] border-t-[#EF3C00]" /><p className="text-sm">Caricamento annunci...</p></div>;

  if (error) return <div className="rounded-2xl border border-red-900/60 bg-red-950/30 p-6 text-red-300"><p className="text-sm font-semibold">Impossibile caricare gli annunci</p><p className="mt-1 text-sm text-red-400">{error}</p><button type="button" onClick={onRetry} className="btn-accent mt-4 cursor-pointer px-4 py-2 text-xs font-semibold">Riprova</button></div>;

  if (advertisements.length === 0) return <div className="rounded-2xl border border-dashed border-[#383842] bg-[#111116] p-12 text-center"><p className="font-semibold text-white">Nessun annuncio trovato</p><p className="mx-auto mt-2 max-w-sm text-sm text-[#A6A6A6]">Prova a cambiare i filtri oppure crea un nuovo annuncio.</p></div>;

  return (
    <section aria-label="Elenco annunci" className="overflow-hidden rounded-2xl border border-[#292929] bg-[#111116]/95 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#292929] px-5 py-4 sm:px-6">
        <div><h2 className="text-base font-semibold text-white">Annunci</h2><p className="mt-0.5 text-xs text-[#A6A6A6]">Apri un annuncio per vedere e modificare i testi.</p></div>
        <span className="rounded-full border border-[#383842] bg-[#242528] px-3 py-1 text-xs font-medium text-[#D6D6DA]" aria-live="polite">{advertisements.length} {advertisements.length === 1 ? 'annuncio' : 'annunci'}</span>
      </div>

      <div className="divide-y divide-[#292929] lg:hidden">
        {advertisements.map((ad) => (
          <article key={ad.id} className="space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2"><ChannelBadge channel={ad.channel} /><StatusBadge status={ad.status} /></div>
            <div><h3 className="text-base font-semibold leading-snug text-white">{ad.jobOffer?.title ?? 'Posizione non disponibile'}</h3><p className="mt-1 text-xs text-[#A6A6A6]">Sede: {ad.jobOffer?.defaultLocation ?? ad.jobOffer?.location ?? 'Non specificata'}</p></div>
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#19191F] p-3 text-xs">
              <div><span className="block text-[#8E8E93]">Formato</span><span className="mt-1 block font-medium text-[#E1E1E6]">{formatLabels[ad.format]}</span></div>
              <div><span className="block text-[#8E8E93]">Varianti</span><span className="mt-1 block font-medium text-[#E1E1E6]">{ad.variantsCount} {ad.variantsCount === 1 ? 'variante' : 'varianti'}</span></div>
              <div className="col-span-2"><span className="block text-[#8E8E93]">Area di diffusione</span><span className="mt-1 block font-medium text-[#E1E1E6]">{ad.targetLocation || 'Tutte le sedi'}</span></div>
            </div>
            <Link href={`/advertisements/${ad.id}`} className="btn-secondary inline-flex min-h-11 w-full items-center justify-center gap-2 text-sm font-semibold">Apri annuncio <span aria-hidden="true">&rarr;</span></Link>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#292929] bg-[#181820] text-[11px] font-semibold uppercase tracking-[0.08em] text-[#A6A6A6]">
            <tr>
              <th scope="col" className="w-[32%] px-6 py-4">Posizione</th>
              <th scope="col" className="px-5 py-4">Canale e formato</th>
              <th scope="col" className="px-5 py-4">Stato</th>
              <th scope="col" className="px-5 py-4">Area di diffusione</th>
              <th scope="col" className="px-5 py-4">Varianti</th>
              <th scope="col" className="px-6 py-4"><span className="sr-only">Apri annuncio</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#292929]">
            {advertisements.map((ad) => (
              <tr key={ad.id} className="transition-colors hover:bg-[#1D1D25] focus-within:bg-[#1D1D25]">
                <td className="px-6 py-5"><Link href={`/advertisements/${ad.id}`} className="font-semibold leading-snug text-white transition-colors hover:text-[#FF704A]">{ad.jobOffer?.title ?? 'Posizione non disponibile'}</Link><p className="mt-1 text-xs leading-relaxed text-[#A6A6A6]">Sede: {ad.jobOffer?.defaultLocation ?? ad.jobOffer?.location ?? 'Non specificata'}</p></td>
                <td className="px-5 py-5"><ChannelBadge channel={ad.channel} /><p className="ml-1 mt-1.5 text-xs text-[#A6A6A6]">{formatLabels[ad.format]}</p></td>
                <td className="px-5 py-5"><StatusBadge status={ad.status} /></td>
                <td className="max-w-[230px] px-5 py-5 text-xs leading-relaxed text-[#D6D6DA]">{ad.targetLocation || 'Tutte le sedi'}</td>
                <td className="px-5 py-5 text-xs font-medium text-[#E1E1E6]">{ad.variantsCount} {ad.variantsCount === 1 ? 'variante' : 'varianti'}</td>
                <td className="px-6 py-5 text-right"><Link href={`/advertisements/${ad.id}`} className="inline-flex min-h-10 items-center gap-2 whitespace-nowrap text-xs font-semibold text-[#FF704A] transition-colors hover:text-white">Apri <span aria-hidden="true">&rarr;</span></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
