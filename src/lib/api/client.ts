export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface ApiRequestOptions<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  headers?: HeadersInit;
  signal?: AbortSignal;
  accessToken?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl = process.env.NEXT_PUBLIC_API_URL) {
    if (!baseUrl) {
      throw new Error('NEXT_PUBLIC_API_URL is not configured.');
    }
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async request<TResponse, TBody = unknown>(
    path: string,
    options: ApiRequestOptions<TBody> = {},
  ): Promise<TResponse> {
    const { method = 'GET', body, headers, signal, accessToken } = options;
    const requestHeaders = new Headers(headers);

    if (body !== undefined) {
      requestHeaders.set('Content-Type', 'application/json');
    }
    if (accessToken) {
      requestHeaders.set('Authorization', `Bearer ${accessToken}`);
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/${path.replace(/^\//, '')}`, {
        method,
        headers: requestHeaders,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal,
        cache: 'no-store',
      });
    } catch (error) {
      throw new ApiError('Unable to reach the backend.', 0, error);
    }

    const payload = await this.parseResponse(response);
    if (!response.ok) {
      const message = this.getErrorMessage(payload, response.statusText);
      throw new ApiError(message, response.status, payload);
    }

    return payload as TResponse;
  }

  get<TResponse>(path: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
    return this.request<TResponse>(path, { ...options, method: 'GET' });
  }

  post<TResponse, TBody = unknown>(path: string, body?: TBody, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
    return this.request<TResponse, TBody>(path, { ...options, method: 'POST', body });
  }

  patch<TResponse, TBody = unknown>(path: string, body?: TBody, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
    return this.request<TResponse, TBody>(path, { ...options, method: 'PATCH', body });
  }

  put<TResponse, TBody = unknown>(path: string, body?: TBody, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
    return this.request<TResponse, TBody>(path, { ...options, method: 'PUT', body });
  }

  delete<TResponse>(path: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
    return this.request<TResponse>(path, { ...options, method: 'DELETE' });
  }

  private async parseResponse(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) return undefined;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  private getErrorMessage(payload: unknown, fallback: string): string {
    if (typeof payload === 'object' && payload !== null && 'message' in payload) {
      const message = payload.message;
      return Array.isArray(message) ? message.join(', ') : String(message);
    }
    return fallback || 'The backend request failed.';
  }
}

export const apiClient = new ApiClient();
