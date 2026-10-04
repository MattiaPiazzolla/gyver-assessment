'use client';

import { AdvertisementChannel, JobOfferSummary } from '@/types/api';

interface AdvertisementFiltersProps {
  jobOffers: JobOfferSummary[];
  selectedJobOfferId: string;
  selectedChannel: AdvertisementChannel | '';
  onJobOfferChange: (jobOfferId: string) => void;
  onChannelChange: (channel: AdvertisementChannel | '') => void;
  onReset: () => void;
  disabled?: boolean;
}

export function AdvertisementFilters({
  jobOffers,
  selectedJobOfferId,
  selectedChannel,
  onJobOfferChange,
  onChannelChange,
  onReset,
  disabled = false,
}: AdvertisementFiltersProps) {
  const hasActiveFilters = Boolean(selectedJobOfferId || selectedChannel);

  return (
    <div className="bg-[#111111] border border-[#292929] rounded-xl p-5 shadow-none flex flex-col md:flex-row gap-4 items-end">
      <div className="w-full md:w-1/2">
        <label
          htmlFor="filter-job-offer"
          className="block text-xs font-mono font-medium text-[#A6A6A6] uppercase tracking-wider mb-2"
        >
          // Filtra per Job Offer
        </label>
        <select
          id="filter-job-offer"
          value={selectedJobOfferId}
          disabled={disabled}
          onChange={(e) => onJobOfferChange(e.target.value)}
          className="w-full px-3.5 py-2.5 text-sm border border-[#292929] rounded-lg bg-[#181818] text-[#F5F5F5] focus:outline-none focus:border-[#FF4B1F] focus:ring-1 focus:ring-[#FF4B1F] disabled:opacity-50 transition-colors"
        >
          <option value="" className="bg-[#181818] text-[#F5F5F5]">Tutte le posizioni</option>
          {jobOffers.map((job) => {
            const loc =
              job.default_location ||
              job.defaultLocation ||
              job.location ||
              'Sede standard';
            return (
              <option key={job.id} value={job.id} className="bg-[#181818] text-[#F5F5F5]">
                {job.title} ({loc})
              </option>
            );
          })}
        </select>
      </div>

      <div className="w-full md:w-1/3">
        <label
          htmlFor="filter-channel"
          className="block text-xs font-mono font-medium text-[#A6A6A6] uppercase tracking-wider mb-2"
        >
          // Filtra per Canale
        </label>
        <select
          id="filter-channel"
          value={selectedChannel}
          disabled={disabled}
          onChange={(e) =>
            onChannelChange(e.target.value as AdvertisementChannel | '')
          }
          className="w-full px-3.5 py-2.5 text-sm border border-[#292929] rounded-lg bg-[#181818] text-[#F5F5F5] focus:outline-none focus:border-[#FF4B1F] focus:ring-1 focus:ring-[#FF4B1F] disabled:opacity-50 transition-colors font-mono"
        >
          <option value="" className="bg-[#181818] text-[#F5F5F5]">Tutti i canali</option>
          <option value="JOB_BOARD" className="bg-[#181818] text-[#F5F5F5]">JOB_BOARD (es. Indeed)</option>
          <option value="WHATSAPP" className="bg-[#181818] text-[#F5F5F5]">WHATSAPP (Chat & Anteprima A4)</option>
          <option value="INSTAGRAM" className="bg-[#181818] text-[#F5F5F5]">INSTAGRAM (Social Ad)</option>
          <option value="TIKTOK" className="bg-[#181818] text-[#F5F5F5]">TIKTOK (Video Ad)</option>
        </select>
      </div>

      {hasActiveFilters && (
        <div className="w-full md:w-auto">
          <button
            type="button"
            onClick={onReset}
            disabled={disabled}
            className="w-full md:w-auto px-4 py-2.5 text-xs font-semibold text-[#A6A6A6] hover:text-[#F5F5F5] bg-[#181818] hover:bg-[#222222] border border-[#292929] rounded-lg transition-colors"
          >
            Azzera Filtri
          </button>
        </div>
      )}
    </div>
  );
}