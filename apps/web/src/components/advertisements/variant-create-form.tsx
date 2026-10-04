'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api-client';
import { AdvertisementDetail } from '@/types/api';

interface VariantCreateFormProps {
    advertisementId: string;
    onSuccess: (updatedAd: AdvertisementDetail) => void;
}

export function VariantCreateForm({ advertisementId, onSuccess }: VariantCreateFormProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [variantGoals, setVariantGoals] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const updatedAd = await api.createVariant(advertisementId, {
                ...(variantGoals.trim() ? { variantGoals: variantGoals.trim() } : {}),
            });
            setVariantGoals('');
            setIsOpen(false);
            onSuccess(updatedAd);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Si è verificato un errore durante la generazione della variante.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-sm transition-colors"
            >
                <span>+ Genera Nuova Variante (AI)</span>
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="border border-blue-200 bg-blue-50/40 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Genera Nuova Variante con AI
                </h3>
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                    className="text-xs text-gray-500 hover:text-gray-800 disabled:opacity-50"
                >
                    Annulla
                </button>
            </div>

            {error && (
                <div className="p-2.5 border border-red-200 bg-red-50 text-red-700 text-xs rounded">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="variantGoals" className="block text-xs font-medium text-gray-700 mb-1">
                    Obiettivo specifico o tono per questa variante (Opzionale)
                </label>
                <input
                    id="variantGoals"
                    type="text"
                    placeholder="es. Tono più diretto, focus su retribuzione e flessibilità oraria"
                    value={variantGoals}
                    disabled={isSubmitting}
                    onChange={(e) => setVariantGoals(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                />
            </div>

            <div className="flex justify-end gap-2 pt-1">
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded shadow-sm disabled:opacity-50"
                >
                    Chiudi
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm transition-colors disabled:bg-blue-400"
                >
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                            <span>Generazione in corso...</span>
                        </>
                    ) : (
                        'Genera Variante'
                    )}
                </button>
            </div>
        </form>
    );
}