const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('salon_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message ?? 'Request failed');
  }

  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ access_token: string; user: import('./types').Profile }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    signup: (data: { name: string; store_name?: string; phone?: string; email: string; password: string }) =>
      request<import('./types').Profile>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => request<import('./types').Profile>('/auth/me'),
  },

  services: {
    list: (gender: string) => request<import('./types').Service[]>(`/services?gender=${gender}`),
  },

  clients: {
    lookup: (phone: string) => request<import('./types').Client | null>(`/clients/lookup?phone=${encodeURIComponent(phone)}`),
    create: (data: { name: string; phone: string; gender: string; age?: number }) =>
      request<import('./types').Client>('/clients', { method: 'POST', body: JSON.stringify(data) }),
    list: (page = 1, search = '') =>
      request<{ data: import('./types').Client[]; total: number }>(`/clients?page=${page}&search=${encodeURIComponent(search)}`),
    get: (id: string) => request<import('./types').Client>(`/clients/${id}`),
  },

  sessions: {
    create: (data: FormData) =>
      fetch(`${BASE_URL}/sessions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: data,
      }).then(r => r.json()),
    get: (id: string) => request<import('./types').Session>(`/sessions/${id}`),
    list: (page = 1) => request<{ data: import('./types').Session[]; total: number }>(`/sessions?page=${page}`),
    selectSuggestion: (sessionId: string, suggestionId: string) =>
      request(`/sessions/${sessionId}/select`, {
        method: 'PATCH',
        body: JSON.stringify({ suggestion_id: suggestionId }),
      }),
  },

  ai: {
    suggest: (sessionId: string) =>
      request<import('./types').Suggestion[]>('/ai/suggest', {
        method: 'POST',
        body: JSON.stringify({ session_id: sessionId }),
      }),
    generateDescription: (gender: string, serviceIds: string[], photo?: string, description?: string) =>
      request<{ description: string }>('/ai/generate-description', {
        method: 'POST',
        body: JSON.stringify({ gender, service_ids: serviceIds, photo, description }),
      }),
  },

  analytics: {
    overview: () => request<import('./types').AnalyticsOverview>('/analytics/overview'),
    retention: (period: 'week' | 'month') => request<{ date: string; new: number; returning: number }[]>(`/analytics/retention?period=${period}`),
    services: () => request<{ name: string; count: number }[]>('/analytics/services'),
    topClients: () => request<import('./types').Client[]>('/analytics/clients/top'),
  },

  admin: {
    listUsers: () => request<import('./types').Profile[]>('/admin/users'),
    createUser: (data: { name: string; email: string; password: string; role: string }) =>
      request<import('./types').Profile>('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
    deleteUser: (id: string) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  },
};
