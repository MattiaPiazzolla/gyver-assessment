'use client';

interface ErrorBannerProps {
  message: string | null;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div className="p-4 border border-red-900/60 bg-red-950/40 text-red-300 text-xs rounded-xl flex items-start justify-between gap-3 shadow-none">
      <div className="flex items-start gap-2">
        <span className="font-bold text-red-400 font-mono">{"// Errore:"}</span>
        <span className="font-normal text-red-200">{message}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-red-400 hover:text-red-200 font-bold text-sm ml-2 cursor-pointer"
        >
          &times;
        </button>
      )}
    </div>
  );
}