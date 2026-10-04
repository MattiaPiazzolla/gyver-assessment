'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AdvertisementChannel, JobOfferSummary } from '@/types/api';
import { ChannelIcon, channelOptions } from './advertisement-display';

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
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const hasActiveFilters = Boolean(selectedJobOfferId || selectedChannel);

  const selectedJob = useMemo(
    () => jobOffers.find((job) => job.id === selectedJobOfferId),
    [jobOffers, selectedJobOfferId]
  );

  const selectedJobLocation = selectedJob
    ? selectedJob.default_location || selectedJob.defaultLocation || selectedJob.location || ''
    : '';

  // Filtro con parole chiave (titolo, sede, descrizione)
  const filteredJobOffers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return jobOffers;
    return jobOffers.filter((job) => {
      const title = (job.title || '').toLowerCase();
      const loc = (
        job.default_location ||
        job.defaultLocation ||
        job.location ||
        ''
      ).toLowerCase();
      const desc = (job.description || '').toLowerCase();
      return title.includes(q) || loc.includes(q) || desc.includes(q);
    });
  }, [jobOffers, searchQuery]);

  // Focus automatico sul campo di ricerca all'apertura del dropdown
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Chiusura al click esterno
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Chiusura con tasto Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleResetAll = () => {
    setIsOpen(false);
    setSearchQuery('');
    onReset();
  };

  return (
    <div className="grid gap-4 rounded-2xl border border-[#292929]/80 bg-[#111116]/80 p-4 shadow-lg backdrop-blur-md sm:p-5 xl:grid-cols-[minmax(340px,42%)_minmax(0,1fr)] xl:items-end xl:gap-6">
      {/* Selettore Posizione con Ricerca per Parole Chiave */}
      <div className="min-w-0" ref={containerRef}>
        <label
          htmlFor="filter-job-offer-btn"
          className="block text-xs font-semibold text-[#A6A6A6] mb-1.5"
        >
          Posizione
        </label>

        <div className="relative">
          {/* Trigger button */}
          <button
            id="filter-job-offer-btn"
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            className={`h-10 w-full flex items-center justify-between rounded-xl border bg-[#171720] px-3.5 text-sm text-left transition-all disabled:opacity-50 ${
              isOpen
                ? 'border-[#EF3C00] ring-1 ring-[#EF3C00]'
                : selectedJobOfferId
                ? 'border-[#EF3C00]/70 text-[#F5F5F5]'
                : 'border-[#2B2B33] text-[#F5F5F5] hover:border-[#383842]'
            }`}
          >
            <span className="truncate pr-2">
              {selectedJob ? (
                <>
                  <span className="font-medium text-[#F5F5F5]">{selectedJob.title}</span>
                  {selectedJobLocation && (
                    <span className="text-xs text-[#A6A6A6] ml-1.5">
                      ({selectedJobLocation})
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[#F5F5F5]">Tutte le posizioni</span>
              )}
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              {selectedJobOfferId && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onJobOfferChange('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      onJobOfferChange('');
                    }
                  }}
                  className="p-1 rounded-md text-[#737373] hover:text-[#F5F5F5] hover:bg-[#2B2B33] transition-colors cursor-pointer"
                  title="Deseleziona posizione"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}

              <svg
                className={`w-4 h-4 text-[#A6A6A6] transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-[#EF3C00]' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {/* Menu Dropdown con Ricerca */}
          {isOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-full z-50 rounded-xl border border-[#2B2B33] bg-[#14141B] shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Barra di ricerca con parole chiave */}
              <div className="p-2 border-b border-[#24252D] bg-[#171722]">
                <div className="relative flex items-center">
                  <svg
                    className="w-4 h-4 text-[#737373] absolute left-3 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cerca per titolo, sede, parola chiave..."
                    className="w-full h-9 pl-9 pr-8 text-xs rounded-lg bg-[#1E1E28] border border-[#2F303B] text-[#F5F5F5] placeholder-[#737373] focus:outline-none focus:border-[#EF3C00] focus:ring-1 focus:ring-[#EF3C00] transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 p-0.5 rounded text-[#737373] hover:text-[#F5F5F5] transition-colors"
                      title="Cancella testo"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Lista opzioni scrollabile */}
              <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
                {/* Opzione: Tutte le posizioni */}
                {!searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      onJobOfferChange('');
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-left transition-colors cursor-pointer ${
                      selectedJobOfferId === ''
                        ? 'bg-[#EF3C00]/15 text-[#EF3C00] font-medium'
                        : 'text-[#F5F5F5] hover:bg-[#20202B]'
                    }`}
                  >
                    <span>Tutte le posizioni</span>
                    {selectedJobOfferId === '' && (
                      <svg className="w-4 h-4 text-[#EF3C00]" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                )}

                {/* Opzioni filtrate */}
                {filteredJobOffers.map((job) => {
                  const loc =
                    job.default_location ||
                    job.defaultLocation ||
                    job.location ||
                    'Sede standard';
                  const isSelected = selectedJobOfferId === job.id;

                  return (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => {
                        onJobOfferChange(job.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#EF3C00]/15 text-[#EF3C00] font-medium'
                          : 'text-[#F5F5F5] hover:bg-[#20202B]'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-medium truncate text-[#F5F5F5]">{job.title}</div>
                        <div className="text-[11px] text-[#A6A6A6] truncate">{loc}</div>
                      </div>
                      {isSelected && (
                        <svg className="w-4 h-4 text-[#EF3C00] shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })}

                {filteredJobOffers.length === 0 && (
                  <div className="py-6 px-3 text-center text-xs text-[#737373]">
                    Nessuna posizione trovata per &ldquo;{searchQuery}&rdquo;
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filtro Canali */}
      <div className="min-w-0">
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <p id="channel-filter-label" className="text-xs font-semibold text-[#A6A6A6]">
            Canale
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetAll}
              disabled={disabled}
              className="cursor-pointer text-xs font-semibold text-[#FF704A] underline-offset-4 hover:underline disabled:opacity-50"
            >
              Azzera filtri
            </button>
          )}
        </div>

        <div role="group" aria-labelledby="channel-filter-label" className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={selectedChannel === ''}
            disabled={disabled}
            onClick={() => onChannelChange('')}
            className={`min-h-10 rounded-full border px-4 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer ${
              selectedChannel === ''
                ? 'border-[#EF3C00] bg-[#EF3C00]/15 text-white'
                : 'border-[#383842] bg-[#242528] text-[#A6A6A6] hover:text-white'
            }`}
          >
            Tutti
          </button>
          {channelOptions.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={selectedChannel === value}
              disabled={disabled}
              onClick={() => onChannelChange(value)}
              className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer ${
                selectedChannel === value
                  ? 'border-[#EF3C00] bg-[#EF3C00]/15 text-white'
                  : 'border-[#383842] bg-[#242528] text-[#BDBDC3] hover:border-[#5A5A62] hover:text-white'
              }`}
            >
              <ChannelIcon channel={value} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
