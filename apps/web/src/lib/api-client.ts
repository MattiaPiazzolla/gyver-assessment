import {
  AdvertisementDetail,
  AdvertisementFilters,
  AdvertisementListItem,
  CreateAdvertisementPayload,
  CreateVariantPayload,
  JobOfferSummary,
  UpdateVariantPayload,
} from '@/types/api';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const DEFAULT_COMPANY_ID =
  process.env.NEXT_PUBLIC_DEFAULT_COMPANY_ID || 'a0000000-0000-0000-0000-000000000001';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-company-id': DEFAULT_COMPANY_ID,
    ...((options.headers as Record<string, string>) || {}),
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(0, 'Backend non raggiungibile. Verifica che il server NestJS sia attivo sulla porta corretta.');
  }

  if (!response.ok) {
    let backendMessage = '';
    let details: unknown = undefined;

    try {
      const data = await response.json();
      details = data;
      if (typeof data.message === 'string') {
        backendMessage = data.message;
      } else if (Array.isArray(data.message)) {
        backendMessage = data.message.join(', ');
      }
    } catch {
      // Risposta non JSON
    }

    switch (response.status) {
      case 400:
        throw new ApiError(
          400,
          backendMessage || 'Richiesta non valida. Controlla i dati inseriti nei campi obbligatori.',
          details
        );
      case 401:
        throw new ApiError(
          401,
          'Accesso non autorizzato. Identificativo azienda (x-company-id) mancante o non valido.',
          details
        );
      case 404:
        throw new ApiError(
          404,
          backendMessage || 'Risorsa richiesta non trovata.',
          details
        );
      case 502:
        throw new ApiError(
          502,
          'Servizio di generazione AI temporaneamente non disponibile. Riprova tra poco.',
          details
        );
      default:
        throw new ApiError(
          response.status,
          backendMessage || 'Si è verificato un errore inatteso durante l’elaborazione.',
          details
        );
    }
  }

  return response.json() as Promise<T>;
}

export const api = {
  getJobOffers: async (): Promise<JobOfferSummary[]> => {
    return request<JobOfferSummary[]>('/job-offers');
  },

  getAdvertisements: async (filters?: AdvertisementFilters): Promise<AdvertisementListItem[]> => {
    const params = new URLSearchParams();
    if (filters?.jobOfferId) {
      params.append('jobOfferId', filters.jobOfferId);
    }
    if (filters?.channel) {
      params.append('channel', filters.channel);
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<AdvertisementListItem[]>(`/advertisements${query}`);
  },

  getAdvertisementById: async (id: string): Promise<AdvertisementDetail> => {
    return request<AdvertisementDetail>(`/advertisements/${id}`);
  },

  createAdvertisement: async (payload: CreateAdvertisementPayload): Promise<AdvertisementDetail> => {
    return request<AdvertisementDetail>('/advertisements', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  createVariant: async (
    advertisementId: string,
    payload: CreateVariantPayload = {}
  ): Promise<AdvertisementDetail> => {
    return request<AdvertisementDetail>(`/advertisements/${advertisementId}/variants`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateVariant: async (
    advertisementId: string,
    variantId: string,
    payload: UpdateVariantPayload
  ): Promise<AdvertisementDetail> => {
    return request<AdvertisementDetail>(`/advertisements/${advertisementId}/variants/${variantId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};