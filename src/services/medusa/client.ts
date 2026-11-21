export interface MedusaClientConfig {
  baseUrl?: string;
}

/**
 * Minimal transport boundary for the future Medusa integration.
 * No requests are made until a caller explicitly uses the returned client.
 */
export function createMedusaClient(config: MedusaClientConfig = {}) {
  const baseUrl = config.baseUrl ?? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;

  return {
    baseUrl,
    async request<T>(_path: string, _init?: RequestInit): Promise<T> {
      void _path;
      void _init;
      throw new Error("Medusa client is not connected yet.");
    },
  };
}
