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
            <div className="p-8 border border-dashed rounded-lg bg-gray-50 text-center text-gray-500">
                <p className="text-sm font-medium">Nessuna variante disponibile per questo annuncio.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
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
                        className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:border-gray-300 transition-colors"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 text-sm">
                                    {variant.variantName || `Variante #${index + 1}`}
                                </span>
                                <span className="text-xs text-gray-400 font-mono">({variant.id.slice(0, 8)})</span>
                            </div>

                            <div className="flex items-center gap-3">
                                {variant.isEdited ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                        Modificata
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                        Originale AI
                                    </span>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setEditingVariantId(variant.id)}
                                    className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded transition-colors"
                                >
                                    Modifica
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Headline
                                </span>
                                <p className="font-medium text-gray-900 bg-gray-50 p-2.5 rounded border border-gray-100">
                                    {variant.headline}
                                </p>
                            </div>

                            <div>
                                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Body Text
                                </span>
                                <p className="text-gray-800 whitespace-pre-line bg-gray-50 p-2.5 rounded border border-gray-100 font-normal">
                                    {variant.bodyText}
                                </p>
                            </div>

                            <div>
                                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Call to Action
                                </span>
                                <p className="font-medium text-blue-700 bg-blue-50/50 p-2 rounded border border-blue-100 inline-block text-xs">
                                    {variant.callToAction}
                                </p>
                            </div>

                            {variant.creativeNotes && (
                                <div>
                                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                        Creative Notes
                                    </span>
                                    <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 italic">
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