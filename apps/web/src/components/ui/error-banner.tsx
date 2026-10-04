'use client';

interface ErrorBannerProps {
    message: string | null;
    onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
    if (!message) return null;

    return (
        <div className="p-3.5 border border-red-200 bg-red-50 text-red-700 text-xs rounded-md flex items-start justify-between gap-2 shadow-sm">
            <div className="flex items-start gap-2">
                <span className="font-bold text-red-800">Errore:</span>
                <span className="font-normal">{message}</span>
            </div>
            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    className="text-red-500 hover:text-red-800 font-semibold text-xs ml-2"
                >
                    &times;
                </button>
            )}
        </div>
    );
}