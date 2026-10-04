import { AdvertisementChannel, AdvertisementFormat } from '@/types/api';

export interface PostVisualAsset {
  src: string;
  alt: string;
  label: string;
  badge: string;
  dimensions: string;
  aspectRatio: string;
}

/** Restituisce la grafica dimostrativa solo per la campagna a cui appartiene. */
export function getPostVisualAsset(
  format?: AdvertisementFormat | string,
  channel?: AdvertisementChannel | string,
  creativeNotes?: string | null,
  jobOfferTitle?: string
): PostVisualAsset | null {
  // L'unico asset disponibile raffigura la campagna fotovoltaico di AB Group.
  // Non usarlo come se fosse la creatività generata per altre posizioni.
  const matchesAvailableCampaign =
    /fotovoltaic/i.test(jobOfferTitle ?? '') && /AB Group/i.test(jobOfferTitle ?? '');
  if (!matchesAvailableCampaign) return null;
  if (format === 'STORY' || channel === 'TIKTOK') return null;

  const isVisualFormat =
    format === 'FEED_POST' ||
    channel === 'INSTAGRAM';

  const notesMentionVisual =
    typeof creativeNotes === 'string' &&
    (creativeNotes.includes('1080x1080') ||
      creativeNotes.toLowerCase().includes('creative quadrata') ||
      creativeNotes.toLowerCase().includes('foto di tecnico') ||
      creativeNotes.toLowerCase().includes('immagine') ||
      creativeNotes.toLowerCase().includes('visual'));

  if (isVisualFormat || notesMentionVisual) {
    return {
      src: '/job-post/ADS_post_tech_assignment.webp',
      alt: 'Creatività visuale annuncio — Tecnico Fotovoltaico',
      label: 'Asset Visivo 1080×1080',
      badge: 'Visual Post',
      dimensions: '1080 × 1080 px (1:1)',
      aspectRatio: 'aspect-square',
    };
  }

  return null;
}
