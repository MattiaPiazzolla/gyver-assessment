'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import {
    AdvertisementChannel,
    AdvertisementFormat,
    CreateAdvertisementPayload,
    JobOfferSummary,
} from '@/types/api';

interface AdvertisementFormProps {
    jobOffers: JobOfferSummary[];
    onCancel: () => void;
}

export function AdvertisementForm({ jobOffers, onCancel }: AdvertisementFormProps) {
    const router = useRouter();

    const [jobOfferId, setJobOfferId] = useState<string>(jobOffers[0]?.id || '');
    const [channel, setChannel] = useState<AdvertisementChannel>('JOB_BOARD');
    const [format, setFormat] = useState<AdvertisementFormat>('JOB_POSTING');
    const [targetLocation, setTargetLocation] = useState<string>('');
    const [variantGoals, setVariantGoals] = useState<string>('');

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!jobOfferId) {
            setError('Seleziona una Job Offer valida.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const payload: CreateAdvertisementPayload = {
            jobOfferId,
            channel,
            format,
            ...(targetLocation.trim() ? { targetLocation: targetLocation.trim() } : {}),
            ...(variantGoals.trim() ? { variantGoals: variantGoals.trim() } : {}),
        };

        try {
            const createdAd = await api.createAdvertisement(payload);
            router.push(`/advertisements/${createdAd.id}`);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Si è verificato un errore durante la generazione dell’annuncio.');
            }
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                <h2 className="text-base font-bold text-gray-900">Crea Nuovo Annuncio (con AI)</h2>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="text-xs text-gray-500 hover:text-gray-800 disabled:opacity-50"
                >
                    Chiudi
                </button>
            </div>

            {error && (
                <div className="mb-5 p-3.5 border border-red-200 bg-red-50 text-red-700 text-xs rounded-md">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Job Offer */}
                <div className="md:col-span-2">
                    <label htmlFor="jobOfferId" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Job Offer di Riferimento *
                    </label>
                    <select
                        id="jobOfferId"
                        value={jobOfferId}
                        disabled={isSubmitting}
                        onChange={(e) => setJobOfferId(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                        required
                    >
                        {jobOffers.map((job) => {
                            const loc = job.default_location || job.defaultLocation || job.location || 'Sede aziendale';
                            return (
                                <option key={job.id} value={job.id}>
                                    {job.title} ({loc})
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* Canale */}
                <div>
                    <label htmlFor="channel" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Canale di Destinazione *
                    </label>
                    <select
                        id="channel"
                        value={channel}
                        disabled={isSubmitting}
                        onChange={(e) => setChannel(e.target.value as AdvertisementChannel)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                        required
                    >
                        <option value="JOB_BOARD">JOB_BOARD</option>
                        <option value="WHATSAPP">WHATSAPP</option>
                        <option value="INSTAGRAM">INSTAGRAM</option>
                        <option value="TIKTOK">TIKTOK</option>
                    </select>
                </div>

                {/* Formato */}
                <div>
                    <label htmlFor="format" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Formato Contenuto *
                    </label>
                    <select
                        id="format"
                        value={format}
                        disabled={isSubmitting}
                        onChange={(e) => setFormat(e.target.value as AdvertisementFormat)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                        required
                    >
                        <option value="JOB_POSTING">JOB_POSTING</option>
                        <option value="MESSAGE">MESSAGE</option>
                        <option value="FEED_POST">FEED_POST</option>
                        <option value="STORY">STORY</option>
                    </select>
                </div>

                {/* Target Location */}
                <div>
                    <label htmlFor="targetLocation" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Target Location (Opzionale)
                    </label>
                    <input
                        id="targetLocation"
                        type="text"
                        placeholder="es. Milano, Ibrido, Remoto"
                        value={targetLocation}
                        disabled={isSubmitting}
                        onChange={(e) => setTargetLocation(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                    />
                </div>

                {/* Variant Goals */}
                <div>
                    <label htmlFor="variantGoals" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Obiettivo Variante / Tone (Opzionale)
                    </label>
                    <input
                        id="variantGoals"
                        type="text"
                        placeholder="es. Focus su benefit tecnici, stile informale"
                        value={variantGoals}
                        disabled={isSubmitting}
                        onChange={(e) => setVariantGoals(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-300 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                >
                    Annulla
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm disabled:bg-blue-400"
                >
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            <span>Generazione AI in corso...</span>
                        </>
                    ) : (
                        'Genera Annuncio'
                    )}
                </button>
            </div>
        </form>
    );
}