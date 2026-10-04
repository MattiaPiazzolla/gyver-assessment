'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api-client';
import { AdvertisementVariant, UpdateVariantPayload } from '@/types/api';

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
        <form onSubmit={handleSubmit} className="border border-amber-300 bg-amber-50/20 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-amber-100">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Modifica Manuale: {variant.variantName}
                </h4>
                <button
                    type="button"
                    onClick={onCancel}
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
                <label htmlFor={`headline-${variant.id}`} className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Headline *
                </label>
                <input
                    id={`headline-${variant.id}`}
                    type="text"
                    value={headline}
                    disabled={isSubmitting}
                    onChange={(e) => setHeadline(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:bg-gray-100"
                />
            </div>

            <div>
                <label htmlFor={`bodyText-${variant.id}`} className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Body Text *
                </label>
                <textarea
                    id={`bodyText-${variant.id}`}
                    rows={5}
                    value={bodyText}
                    disabled={isSubmitting}
                    onChange={(e) => setBodyText(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:bg-gray-100"
                />
            </div>

            <div>
                <label htmlFor={`cta-${variant.id}`} className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Call to Action *
                </label>
                <input
                    id={`cta-${variant.id}`}
                    type="text"
                    value={callToAction}
                    disabled={isSubmitting}
                    onChange={(e) => setCallToAction(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:bg-gray-100"
                />
            </div>

            <div>
                <label htmlFor={`notes-${variant.id}`} className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Creative Notes (Opzionale)
                </label>
                <textarea
                    id={`notes-${variant.id}`}
                    rows={2}
                    value={creativeNotes}
                    disabled={isSubmitting}
                    onChange={(e) => setCreativeNotes(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:bg-gray-100"
                />
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded shadow-sm disabled:opacity-50"
                >
                    Annulla
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded shadow-sm transition-colors disabled:bg-amber-400"
                >
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                            <span>Salvataggio...</span>
                        </>
                    ) : (
                        'Salva Modifiche'
                    )}
                </button>
            </div>
        </form>
    );
}