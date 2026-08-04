const API_BASE = '/api';

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

async function apiRequest<T = unknown>(
  path: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || 'Ein Fehler ist aufgetreten.', status: res.status };
    }

    return { data: data as T, status: res.status };
  } catch {
    return { error: 'Verbindung zum Server fehlgeschlagen.', status: 0 };
  }
}

export const api = {
  post: <T = unknown>(path: string, body: unknown, token?: string) =>
    apiRequest<T>(path, { method: 'POST', body, token }),

  get: <T = unknown>(path: string, token?: string) =>
    apiRequest<T>(path, { method: 'GET', token }),

  put: <T = unknown>(path: string, body: unknown, token?: string) =>
    apiRequest<T>(path, { method: 'PUT', body, token }),

  delete: <T = unknown>(path: string, token?: string) =>
    apiRequest<T>(path, { method: 'DELETE', token }),
};
