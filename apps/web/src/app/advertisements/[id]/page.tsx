'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { AdvertisementDetail } from '@/types/api';
import { VariantList } from '@/components/advertisements/variant-list';
import { VariantCreateForm } from '@/components/advertisements/variant-create-form';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function AdvertisementDetailPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const advertisementId = resolvedParams.id;

    const [advertisement, setAdvertisement] = useState<AdvertisementDetail | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDetail = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.getAdvertisementById(advertisementId);
            setAdvertisement(data);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Impossibile caricare il dettaglio annuncio.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [advertisementId]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    const handleVariantCreated = async () => {
        await fetchDetail();
    };

    if (isLoading) {
        return (
            <main className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center p-16 border border-dashed rounded-lg bg-gray-50 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-3" />
                    <p className="text-sm font-medium">Caricamento dettagli annuncio...</p>
                </div>
            </main>
        );
    }

    if (error || !advertisement) {
        return (
            <main className="max-w-5xl mx-auto px-4 py-8">
                <div className="p-6 border border-red-200 rounded-lg bg-red-50 text-red-700">
                    <p className="font-semibold text-sm">Errore nel caricamento:</p>
                    <p className="text-sm mt-1">{error || 'Annuncio non trovato.'}</p>
                    <div className="mt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={fetchDetail}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded shadow-sm transition-colors"
                        >
                            Riprova
                        </button>
                        <Link
                            href="/"
                            className="px-3 py-1.5 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 text-xs font-semibold rounded shadow-sm transition-colors"
                        >
                            Torna alla lista
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const variantsList = advertisement.variants ?? [];

    return (
        <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
            {/* Header navigazione */}
            <div>
                <Link
                    href="/"
                    className="text-xs font-semibold text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 mb-3"
                >
                    &larr; Torna a tutti gli annunci
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                            Dettaglio Annuncio
                        </h1>
                        <p className="text-xs font-mono text-gray-400 mt-1">ID: {advertisement.id}</p>
                    </div>
                    <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded border self-start sm:self-auto ${advertisement.status === 'PUBLISHED'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : advertisement.status === 'ARCHIVED'
                                    ? 'bg-gray-100 text-gray-600 border-gray-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                    >
                        {advertisement.status}
                    </span>
                </div>
            </div>

            {/* Scheda Riepilogo Parametri Annuncio & Job Offer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Metadati Annuncio */}
                <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm space-y-2">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Configurazione Annuncio
                    </h2>
                    <div className="grid grid-cols-2 gap-2 text-sm pt-1">
                        <div>
                            <span className="text-xs text-gray-400 block">Canale:</span>
                            <span className="font-medium text-gray-800">{advertisement.channel}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-400 block">Formato:</span>
                            <span className="font-medium text-gray-800">{advertisement.format}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-400 block">Target Location:</span>
                            <span className="font-medium text-gray-800">
                                {advertisement.targetLocation || 'Globale'}
                            </span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-400 block">Varianti totali:</span>
                            <span className="font-medium text-gray-800">{variantsList.length}</span>
                        </div>
                    </div>
                </div>

                {/* Job Offer di riferimento */}
                <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm space-y-2">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Job Offer di Origine
                    </h2>
                    <div className="text-sm pt-1 space-y-1">
                        <p className="font-bold text-gray-900">{advertisement.jobOffer?.title}</p>
                        <p className="text-xs text-gray-600">
                            {advertisement.jobOffer?.defaultLocation || advertisement.jobOffer?.location || 'Sede aziendale'}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">ID: {advertisement.jobOffer?.id}</p>
                    </div>
                </div>
            </div>

            {/* Sezione Varianti */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Varianti Generate</h2>
                        <p className="text-xs text-gray-500">
                            {variantsList.length}{' '}
                            {variantsList.length === 1 ? 'variante presente' : 'varianti presenti'}
                        </p>
                    </div>

                    <VariantCreateForm
                        advertisementId={advertisement.id}
                        onSuccess={handleVariantCreated}
                    />
                </div>

                <VariantList
                    advertisementId={advertisement.id}
                    variants={variantsList}
                    onRefresh={fetchDetail}
                />
            </div>
        </main>
    );
}