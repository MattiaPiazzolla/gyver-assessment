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
            <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-gray-50 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-3" />
                <p className="text-sm font-medium">Caricamento annunci in corso...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 border border-red-200 rounded-lg bg-red-50 text-red-700">
                <p className="font-semibold text-sm">Errore durante il recupero degli annunci:</p>
                <p className="text-sm mt-1">{error}</p>
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-3 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded shadow-sm transition-colors"
                >
                    Riprova
                </button>
            </div>
        );
    }

    if (advertisements.length === 0) {
        return (
            <div className="text-center p-12 border border-dashed rounded-lg bg-gray-50 text-gray-500">
                <p className="font-medium text-base text-gray-700">Nessun annuncio trovato</p>
                <p className="text-xs text-gray-500 mt-1">
                    Non sono presenti annunci con i filtri selezionati o per questa organizzazione.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-600">
                    <tr>
                        <th className="px-4 py-3">Job Offer</th>
                        <th className="px-4 py-3">Canale</th>
                        <th className="px-4 py-3">Formato</th>
                        <th className="px-4 py-3">Stato</th>
                        <th className="px-4 py-3">Target Location</th>
                        <th className="px-4 py-3 text-center">Varianti</th>
                        <th className="px-4 py-3 text-right">Azione</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {advertisements.map((ad) => (
                        <tr key={ad.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                                <div className="font-medium text-gray-900">{ad.jobOffer?.title ?? 'N/D'}</div>
                                <div className="text-xs text-gray-500">{ad.jobOffer?.defaultLocation ?? ad.jobOffer?.location ?? 'Sede aziendale'}</div>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs">
                                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                    {ad.channel}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600">{ad.format}</td>
                            <td className="px-4 py-3 text-xs">
                                <span
                                    className={`px-2 py-0.5 rounded font-medium border ${ad.status === 'PUBLISHED'
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : ad.status === 'ARCHIVED'
                                                ? 'bg-gray-100 text-gray-600 border-gray-200'
                                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}
                                >
                                    {ad.status}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600">{ad.targetLocation ?? 'Globale'}</td>
                            <td className="px-4 py-3 text-center">
                                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                    {ad.variantsCount}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <Link
                                    href={`/advertisements/${ad.id}`}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    Dettaglio &rarr;
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}