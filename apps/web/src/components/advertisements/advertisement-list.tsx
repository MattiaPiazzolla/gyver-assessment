import Link from 'next/link';
import { AdvertisementListItem } from '@/types/api';

interface AdvertisementListProps {
  advertisements: AdvertisementListItem[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function AdvertisementList({
  advertisements,
  isLoading,
  error,
  onRetry,
}: AdvertisementListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 border border-[#292929] rounded-xl bg-[#111111] text-[#A6A6A6]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#292929] border-t-[#FF4B1F] mb-4" />
        <p className="text-sm font-mono">Caricamento annunci in corso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-red-900/60 rounded-xl bg-red-950/30 text-red-300">
        <p className="font-semibold text-sm">Errore durante il recupero degli annunci:</p>
        <p className="text-sm text-red-400 mt-1">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-[#FF4B1F] hover:bg-[#FF5525] text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Riprova
        </button>
      </div>
    );
  }

  if (advertisements.length === 0) {
    return (
      <div className="text-center p-16 border border-dashed border-[#292929] rounded-xl bg-[#111111] text-[#A6A6A6]">
        <p className="font-semibold text-base text-[#F5F5F5]">Nessun annuncio trovato</p>
        <p className="text-xs text-[#737373] mt-1 max-w-sm mx-auto">
          Non sono presenti annunci con i filtri selezionati. Prova a reimpostare i filtri o genera un nuovo annuncio.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-[#292929] rounded-xl bg-[#111111]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#292929] text-left text-sm">
          <thead className="bg-[#0D0D0D] text-[11px] font-mono uppercase tracking-wider text-[#737373]">
            <tr>
              <th className="px-5 py-3.5">Job Offer</th>
              <th className="px-5 py-3.5">Canale</th>
              <th className="px-5 py-3.5">Formato</th>
              <th className="px-5 py-3.5">Stato</th>
              <th className="px-5 py-3.5">Target Location</th>
              <th className="px-5 py-3.5 text-center">Varianti</th>
              <th className="px-5 py-3.5 text-right">Azione</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#292929]/70 bg-[#111111]">
            {advertisements.map((ad) => (
              <tr
                key={ad.id}
                className="hover:bg-[#181818] transition-colors group"
              >
                <td className="px-5 py-4">
                  <div className="font-semibold text-[#F5F5F5] group-hover:text-white">
                    {ad.jobOffer?.title ?? 'Job Offer non disponibile'}
                  </div>
                  <div className="text-xs text-[#737373] mt-0.5 flex items-center gap-1 font-mono">
                    <span className="text-[#555555]">Sede:</span>
                    <span>
                      {ad.jobOffer?.defaultLocation ??
                        ad.jobOffer?.location ??
                        'Sede aziendale'}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 font-mono text-xs">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-[#292929] bg-[#181818] text-[#F5F5F5]">
                    {ad.channel}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs text-[#A6A6A6] font-mono">
                  {ad.format}
                </td>
                <td className="px-5 py-4 text-xs">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[11px] border ${
                      ad.status === 'PUBLISHED'
                        ? 'bg-emerald-950/50 text-emerald-400 border-emerald-900/60'
                        : ad.status === 'ARCHIVED'
                        ? 'bg-[#181818] text-[#737373] border-[#292929]'
                        : 'bg-amber-950/50 text-amber-400 border-amber-900/60'
                    }`}
                  >
                    {ad.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs text-[#A6A6A6]">
                  {ad.targetLocation ?? 'Globale'}
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full border border-[#292929] bg-[#181818] text-[#F5F5F5]">
                    {ad.variantsCount}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/advertisements/${ad.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF4B1F] hover:text-[#FF5525] transition-colors"
                  >
                    <span>Gestisci</span>
                    <span>&rarr;</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}