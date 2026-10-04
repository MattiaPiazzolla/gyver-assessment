import type {
  AdvertisementChannel,
  AdvertisementFormat,
  AdvertisementStatus,
} from '@/types/api';

export const channelOptions: { value: AdvertisementChannel; label: string; description: string }[] = [
  { value: 'JOB_BOARD', label: 'Job board', description: 'Annuncio testuale' },
  { value: 'WHATSAPP', label: 'WhatsApp', description: 'Messaggio' },
  { value: 'INSTAGRAM', label: 'Instagram', description: 'Post feed' },
  { value: 'TIKTOK', label: 'TikTok', description: 'Storia' },
];

export const formatLabels: Record<AdvertisementFormat, string> = {
  JOB_POSTING: 'Annuncio testuale',
  MESSAGE: 'Messaggio',
  FEED_POST: 'Post feed',
  STORY: 'Storia',
};

const channelStyles: Record<AdvertisementChannel, string> = {
  JOB_BOARD: 'border-sky-700/50 bg-sky-950/40 text-sky-300',
  WHATSAPP: 'border-emerald-700/50 bg-emerald-950/40 text-emerald-300',
  INSTAGRAM: 'border-fuchsia-700/50 bg-fuchsia-950/40 text-fuchsia-300',
  TIKTOK: 'border-cyan-700/50 bg-cyan-950/40 text-cyan-300',
};

export const statusLabels: Record<AdvertisementStatus, string> = {
  DRAFT: 'Bozza',
  PUBLISHED: 'Pubblicato',
  ARCHIVED: 'Archiviato',
};

const statusStyles: Record<AdvertisementStatus, string> = {
  DRAFT: 'border-amber-800/60 bg-amber-950/40 text-amber-300',
  PUBLISHED: 'border-emerald-800/60 bg-emerald-950/40 text-emerald-300',
  ARCHIVED: 'border-[#383842] bg-[#222228] text-[#B2B2B8]',
};

export function ChannelIcon({ channel, className = 'h-4 w-4' }: {
  channel: AdvertisementChannel;
  className?: string;
}) {
  const shared = { className, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, viewBox: '0 0 24 24', 'aria-hidden': true as const };

  if (channel === 'JOB_BOARD') return <svg {...shared}><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13a20 20 0 0 0 18 0M11 12h2" /></svg>;
  if (channel === 'WHATSAPP') return <svg {...shared}><path d="M20.3 11.6a8.3 8.3 0 0 1-12.2 7.3L3 20l1.2-4.8a8.3 8.3 0 1 1 16.1-3.6Z" /><path d="M8.2 9.1c.6 2.5 2.2 4.2 4.8 5.3l1.8-1.2 1.3 1.2c-.8 1.8-2.4 2-4.6.9-2.2-1-3.8-2.8-4.4-4.8-.6-1.9.1-3.1 1.5-3.5l1.1 1.3-1.5 1.8Z" /></svg>;
  if (channel === 'INSTAGRAM') return <svg {...shared}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
  return <svg {...shared}><path d="M13 3v11.2a4 4 0 1 1-3.5-4M13 4c1.1 2.8 3 4.2 6 4.4v3c-2.4-.1-4.5-1-6-2.5" /></svg>;
}

export function ChannelBadge({ channel }: { channel: AdvertisementChannel }) {
  const label = channelOptions.find((option) => option.value === channel)?.label ?? channel;
  return <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${channelStyles[channel]}`}><ChannelIcon channel={channel} />{label}</span>;
}

export function StatusBadge({ status }: { status: AdvertisementStatus }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />{statusLabels[status]}</span>;
}
